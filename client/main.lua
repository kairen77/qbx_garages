local config = require 'config.client'
if not config.enableClient then return end
local VEHICLES = exports.qbx_core:GetVehiclesByName()

local VehicleCategory = {
	all = {
		[0] = true, [1] = true, [2] = true, [3] = true, [4] = true, [5] = true,
		[6] = true, [7] = true, [8] = true, [9] = true, [10] = true, [11] = true,
		[12] = true, [13] = true, [14] = true, [15] = true, [16] = true, [17] = true,
		[18] = true, [19] = true, [20] = true, [21] = true, [22] = true,
	},
	car = {
		[0] = true,
		[1] = true,
		[2] = true,
		[3] = true,
		[4] = true,
		[5] = true,
		[6] = true,
		[7] = true,
		[8] = true,
		[9] = true,
		[10] = true,
		[11] = true,
		[12] = true,
		[13] = true,
		[14] = true,
		[17] = true,
		[18] = true,
		[19] = true,
		[20] = true,
		[22] = true,
	},
	air = { [15] = true, [16] = true },
	sea = { [14] = true },
}

---@param category VehicleType
---@param vehicle number
---@return boolean
local function isOfType(category, vehicle)
    if category == VehicleType.ALL or category == 'all' then return true end
	local classes = VehicleCategory[category]
	return classes ~= nil and classes[GetVehicleClass(vehicle)] == true
end

---@param vehicle number
local function kickOutPeds(vehicle)
    for i = -1, 5, 1 do
        local seat = GetPedInVehicleSeat(vehicle, i)
        if seat and seat > 0 then
            TaskLeaveVehicle(seat, vehicle, 0)
        end
    end
end

local spawnLock = false

---@param vehicleId number
---@param garageName string
---@param accessPoint integer
local function takeOutOfGarage(vehicleId, garageName, accessPoint)
    if spawnLock then
        exports.qbx_core:Notify(locale('error.spawn_in_progress'), 'error')
        return
    end
    spawnLock = true

    local success, result = pcall(function()
        if cache.vehicle then
            exports.qbx_core:Notify(locale('error.in_vehicle'), 'error')
            return
        end

        local netId = lib.callback.await('qbx_garages:server:spawnVehicle', false, vehicleId, garageName, accessPoint)
        if not netId then return end

        local veh = lib.waitFor(function()
            if NetworkDoesEntityExistWithNetworkId(netId) then
                return NetToVeh(netId)
            end
        end)

        if veh == 0 then
            exports.qbx_core:Notify(locale('error.spawn_failed'), 'error')
            return
        end

        if config.engineOn then
            SetVehicleEngineOn(veh, true, true, false)
        end
    end)
    spawnLock = false
    assert(success, result)
end

---Opens the custom NUI garage window for players
---@param garageName string
---@param garageInfo GarageConfig
---@param accessPoint integer
local function openGarageMenu(garageName, garageInfo, accessPoint)
    ---@type PlayerVehicle[]?
    local vehicleEntities = lib.callback.await('qbx_garages:server:getGarageVehicles', false, garageName)

    if not vehicleEntities or #vehicleEntities == 0 then
        exports.qbx_core:Notify(locale('error.no_vehicles'), 'error')
        return
    end

    lib.hideTextUI()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openGarage',
        data = {
            garageName = garageName,
            garageInfo = garageInfo,
            vehicles = vehicleEntities,
            accessPointIndex = accessPoint,
        }
    })
end

---@param vehicle number
---@param garageName string
local function parkVehicle(vehicle, garageName)
    -- Must have 0 passengers (only driver inside) to safely store
    if GetVehicleNumberOfPassengers(vehicle) == 0 then
        local props = lib.getVehicleProperties(vehicle)
        local isParkable = lib.callback.await('qbx_garages:server:isParkable', false, garageName, NetworkGetNetworkIdFromEntity(vehicle), props)

        if not isParkable then
            exports.qbx_core:Notify(locale('error.not_owned'), 'error', 5000)
            return
        end

        kickOutPeds(vehicle)
        SetVehicleDoorsLocked(vehicle, 2)
        Wait(1000)
        local parked = lib.callback.await('qbx_garages:server:parkVehicle', false, NetworkGetNetworkIdFromEntity(vehicle), lib.getVehicleProperties(vehicle), garageName)
        if parked then
            exports.qbx_core:Notify(locale('success.vehicle_parked'), 'primary', 4500)
        end
    else
        exports.qbx_core:Notify(locale('error.vehicle_occupied'), 'error', 3500)
    end
end

---@param garage GarageConfig
---@return boolean
local function checkCanAccess(garage)
    if garage.groups and not exports.qbx_core:HasPrimaryGroup(garage.groups, QBX.PlayerData) then
        exports.qbx_core:Notify(locale('error.no_access'), 'error')
        return false
    end
    if cache.vehicle and not isOfType(garage.vehicleType, cache.vehicle) then
        exports.qbx_core:Notify(locale('error.not_correct_type'), 'error')
        return false
    end
    return true
end

local activeRadialItems = {}
local garageBlips = {} -- table<string, number[]>
local garageZones = {} -- table<string, any[]>

---Removes all blips and zones associated with a garage
---@param name string
local function removeGarage(name)
    if garageBlips[name] then
        for i = 1, #garageBlips[name] do
            local blip = garageBlips[name][i]
            if DoesBlipExist(blip) then
                RemoveBlip(blip)
            end
        end
        garageBlips[name] = nil
    end

    if garageZones[name] then
        for i = 1, #garageZones[name] do
            local zone = garageZones[name][i]
            if zone and zone.remove then
                pcall(function() zone:remove() end)
            end
        end
        garageZones[name] = nil
    end
end

AddEventHandler('onResourceStop', function(resource)
    if resource ~= cache.resource then return end
    for id in pairs(activeRadialItems) do lib.removeRadialItem(id) end
    for name in pairs(garageBlips) do removeGarage(name) end
    SetNuiFocus(false, false)
end)

---@param garageName string
---@param garage GarageConfig
---@param accessPoint AccessPoint
---@param accessPointIndex integer
local function createZones(garageName, garage, accessPoint, accessPointIndex)
    accessPoint.dropPoint = accessPoint.dropPoint or accessPoint.spawn or accessPoint.coords
    local drawRadius = accessPoint.drawRadius or 60
    local dropDrawRadius = accessPoint.dropDrawRadius or 60
    local useRadius = accessPoint.useRadius or 2.5
    local dropUseRadius = accessPoint.dropUseRadius or 4.0
    local dropZone, coordsZone
    local useRadial = config.interact == 'radialmenu'

    local function createInteractionZone(coords, radius, isDrop)
        local id = ('qbx_garages:%s:%s:%s'):format(garageName, accessPointIndex, isDrop and 'drop' or 'menu')
        local shownAction

        local function getAction()
            if useRadial and not LocalPlayer.state.isLoggedIn then return end
            if isDrop then return cache.vehicle and 'park' or nil end
            if accessPoint.dropPoint and cache.vehicle then return end
            return garage.type == GarageType.DEPOT and 'impound' or cache.vehicle and 'park' or 'car'
        end

        local function selectAction()
            if #(GetEntityCoords(cache.ped) - vec3(coords.x, coords.y, coords.z)) > radius then return end
            local action = getAction()
            if not action or not checkCanAccess(garage) then return end
            if action == 'park' then
                parkVehicle(cache.vehicle, garageName)
            else
                openGarageMenu(garageName, garage, accessPointIndex)
            end
        end

        local function clearInteraction()
            if useRadial then
                lib.removeRadialItem(id)
                activeRadialItems[id] = nil
            elseif shownAction then
                lib.hideTextUI()
            end
            shownAction = nil
        end

        local function updateInteraction()
            local action = getAction()
            if action == shownAction then return end
            clearInteraction()
            shownAction = action
            if not action then return end
            if useRadial then
                activeRadialItems[id] = true
                lib.addRadialItem({
                    id = id,
                    label = locale('info.' .. action .. '_radial'),
                    icon = action == 'park' and 'square-parking' or 'warehouse',
                    onSelect = selectAction,
                })
            else
                lib.showTextUI(locale('info.' .. action .. '_e'))
            end
        end

        local zone = lib.zones.sphere({
            coords = coords,
            radius = radius,
            onEnter = updateInteraction,
            onExit = clearInteraction,
            inside = function()
                updateInteraction()
                if not useRadial and IsControlJustReleased(0, 38) then selectAction() end
            end,
            debug = config.debugPoly,
        })

        if garageZones[garageName] then
            table.insert(garageZones[garageName], zone)
        end
        return zone
    end

    local function createDropZone()
        if dropZone then return end
        dropZone = createInteractionZone(accessPoint.dropPoint, dropUseRadius, true)
    end

    local function createCoordsZone()
        if coordsZone then return end
        coordsZone = createInteractionZone(accessPoint.coords, useRadius, false)
    end

    local outerCoordsZone = lib.zones.sphere({
        coords = accessPoint.coords,
        radius = drawRadius,
        onEnter = function()
            createCoordsZone()
        end,
        onExit = function()
            if coordsZone then
                coordsZone.onExit()
                coordsZone:remove()
                coordsZone = nil
            end
        end,
        inside = function()
            if garage.drawMarker ~= false and accessPoint.drawMarker ~= false then
                config.drawGarageMarker(accessPoint.coords.xyz, useRadius)
            end
        end,
        debug = config.debugPoly,
    })

    if garageZones[garageName] then
        table.insert(garageZones[garageName], outerCoordsZone)
    end

    if accessPoint.dropPoint and garage.type ~= GarageType.DEPOT then
        local outerDropZone = lib.zones.sphere({
            coords = accessPoint.dropPoint,
            radius = dropDrawRadius,
            onEnter = function()
                createDropZone()
            end,
            onExit = function()
                if dropZone then
                    dropZone.onExit()
                    dropZone:remove()
                    dropZone = nil
                end
            end,
            inside = function()
                if garage.drawMarker ~= false and accessPoint.drawMarker ~= false then
                    config.drawDropOffMarker(accessPoint.dropPoint, dropUseRadius)
                end
            end,
            debug = config.debugPoly,
        })

        if garageZones[garageName] then
            table.insert(garageZones[garageName], outerDropZone)
        end
    end
end

---@param garageName string
---@param garageInfo GarageConfig
---@param accessPoint AccessPoint
local function createBlip(garageName, garageInfo, accessPoint)
    local blip = AddBlipForCoord(accessPoint.coords.x, accessPoint.coords.y, accessPoint.coords.z)
    SetBlipSprite(blip, accessPoint.blip.sprite or 357)
    SetBlipDisplay(blip, 4)
    SetBlipScale(blip, 0.60)
    SetBlipAsShortRange(blip, true)
    SetBlipColour(blip, accessPoint.blip.color or 3)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentSubstringPlayerName(accessPoint.blip.name or garageInfo.label)
    EndTextCommandSetBlipName(blip)

    if garageBlips[garageName] then
        table.insert(garageBlips[garageName], blip)
    end
end

---Creates a garage, its blips, and interaction zones
---@param name string
---@param garage GarageConfig
local function createGarage(name, garage)
    removeGarage(name)
    garageBlips[name] = {}
    garageZones[name] = {}

    local accessPoints = garage.accessPoints
    if not accessPoints then return end

    for i = 1, #accessPoints do
        local accessPoint = accessPoints[i]

        if accessPoint.blip then
            createBlip(name, garage, accessPoint)
        end

        createZones(name, garage, accessPoint, i)
    end
end

local function initializeGarages()
    local garages = lib.callback.await('qbx_garages:server:getGarages')
    if not garages then return end
    for name, garage in pairs(garages) do
        createGarage(name, garage)
    end
end

RegisterNetEvent('qbx_garages:client:garageRegistered', function(name, garage)
    createGarage(name, garage)
end)

RegisterNetEvent('qbx_garages:client:garageDeleted', function(name)
    removeGarage(name)
end)

CreateThread(function()
    initializeGarages()
end)

-- =========================================================================
-- NUI CALLBACKS & ADMIN MANAGER COMMAND
-- =========================================================================

RegisterNUICallback('closeUI', function(_, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('spawnVehicle', function(data, cb)
    SetNuiFocus(false, false)
    takeOutOfGarage(data.vehicleId, data.garageName, data.accessPointIndex)
    cb({ success = true })
end)

RegisterNUICallback('getCurrentCoords', function(data, cb)
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    cb({
        x = coords.x,
        y = coords.y,
        z = coords.z,
        w = heading,
    })
end)

RegisterNUICallback('teleportToCoords', function(data, cb)
    if data and data.coords then
        local ped = PlayerPedId()
        SetEntityCoords(ped, data.coords.x + 0.0, data.coords.y + 0.0, data.coords.z + 0.0, false, false, false, true)
        if data.coords.w then
            SetEntityHeading(ped, data.coords.w + 0.0)
        end
    end
    cb({ success = true })
end)

RegisterNUICallback('getGarages', function(_, cb)
    local allGarages = lib.callback.await('qbx_garages:server:getAllGarages', false)
    cb({ garages = allGarages or {} })
end)

RegisterNUICallback('saveGarage', function(data, cb)
    TriggerServerEvent('qbx_garages:server:saveGarage', data)
    cb({ success = true })
end)

RegisterNUICallback('deleteGarage', function(data, cb)
    TriggerServerEvent('qbx_garages:server:deleteGarage', data.name)
    cb({ success = true })
end)

---Command to open in-game garage manager
RegisterCommand('admingarage', function()
    local isAdmin = lib.callback.await('qbx_garages:server:isAdmin', false)
    if not isAdmin then
        exports.qbx_core:Notify('You do not have access to this command.', 'error')
        return
    end

    local allGarages = lib.callback.await('qbx_garages:server:getAllGarages', false)
    lib.hideTextUI()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openAdminManager',
        data = {
            garages = allGarages or {}
        }
    })
end, false)
