local GARAGES_FILE = 'data/custom_garages.json'

---Checks whether a player has administrator permissions
---@param source number
---@return boolean
local function isPlayerAdmin(source)
    if IsPlayerAceAllowed(source, 'command') then return true end
    if exports.qbx_core and exports.qbx_core:HasPermission(source, 'admin') then return true end
    return false
end

---Loads custom garages from data/custom_garages.json
---@return table<string, any>
local function loadCustomGaragesFromFile()
    local content = LoadResourceFile(GetCurrentResourceName(), GARAGES_FILE)
    if not content or content == '' then return {} end
    local ok, data = pcall(json.decode, content)
    if ok and type(data) == 'table' then return data end
    return {}
end

---Saves custom garages to data/custom_garages.json
---@param data table<string, any>
---@return boolean
local function saveCustomGaragesToFile(data)
    return SaveResourceFile(GetCurrentResourceName(), GARAGES_FILE, json.encode(data, { indent = true }), -1)
end

lib.callback.register('qbx_garages:server:isAdmin', function(source)
    return isPlayerAdmin(source)
end)

lib.callback.register('qbx_garages:server:getAllGarages', function(source)
    return Garages
end)

---Merges and loads custom garages on resource start
local function initializeCustomGarages()
    local customs = loadCustomGaragesFromFile()
    local count = 0
    for name, g in pairs(customs) do
        local useDist = tonumber(g.distance) or 3.5
        local accessPoint = {
            coords = vec4(g.interaction.x, g.interaction.y, g.interaction.z, g.interaction.w or 0.0),
            spawn = vec4(g.spawn.x, g.spawn.y, g.spawn.z, g.spawn.w or 0.0),
            dropPoint = g.dropPoint and vec3(g.dropPoint.x, g.dropPoint.y, g.dropPoint.z) or vec3(g.spawn.x, g.spawn.y, g.spawn.z),
            drawRadius = 60,
            useRadius = useDist,
            dropUseRadius = useDist + 0.5,
            drawMarker = g.drawMarker ~= false,
        }

        if g.blipEnabled ~= false then
            accessPoint.blip = {
                name = g.label,
                sprite = tonumber(g.blipSprite) or 357,
                color = tonumber(g.blipColor) or 3,
            }
        end

        local cfg = {
            label = g.label,
            vehicleType = g.vehicleType or VehicleType.CAR,
            groups = (g.groups and g.groups ~= '') and g.groups or nil,
            shared = g.shared == true,
            drawMarker = g.drawMarker ~= false,
            type = g.type == 'depot' and GarageType.DEPOT or nil,
            states = g.type == 'depot' and { VehicleState.OUT, VehicleState.IMPOUNDED } or nil,
            skipGarageCheck = g.type == 'depot' or nil,
            accessPoints = { accessPoint }
        }

        Garages[name] = cfg
        count = count + 1
    end

    if count > 0 then
        lib.print.info(string.format('Loaded %d custom garage(s) from %s', count, GARAGES_FILE))
    end
end

CreateThread(function()
    Wait(500)
    initializeCustomGarages()
end)

---Registers or updates a garage dynamically
---@param source number
---@param data table
RegisterNetEvent('qbx_garages:server:saveGarage', function(data)
    local src = source
    if not isPlayerAdmin(src) then return end

    if not data or not data.name or not data.label or not data.interaction or not data.spawn then
        TriggerClientEvent('ox_lib:notify', src, {
            title = 'Garage Manager',
            description = 'Invalid or incomplete garage data provided.',
            type = 'error'
        })
        return
    end

    local customs = loadCustomGaragesFromFile()
    local dropPointCoords = data.dropPoint or data.spawn
    local useDist = tonumber(data.distance) or 3.5
    customs[data.name] = {
        name = data.name,
        label = data.label,
        type = data.type or 'public',
        vehicleType = data.vehicleType or 'car',
        groups = (data.groups and data.groups ~= '') and data.groups or nil,
        shared = data.shared == true,
        drawMarker = data.drawMarker ~= false,
        blipEnabled = data.blipEnabled ~= false,
        blipSprite = tonumber(data.blipSprite) or 357,
        blipColor = tonumber(data.blipColor) or 3,
        distance = useDist,
        interaction = {
            x = data.interaction.x,
            y = data.interaction.y,
            z = data.interaction.z,
            w = data.interaction.w or 0.0
        },
        spawn = {
            x = data.spawn.x,
            y = data.spawn.y,
            z = data.spawn.z,
            w = data.spawn.w or 0.0
        },
        dropPoint = {
            x = dropPointCoords.x,
            y = dropPointCoords.y,
            z = dropPointCoords.z
        }
    }

    saveCustomGaragesToFile(customs)

    -- Construct active GarageConfig in memory
    local accessPoint = {
        coords = vec4(data.interaction.x, data.interaction.y, data.interaction.z, data.interaction.w or 0.0),
        spawn = vec4(data.spawn.x, data.spawn.y, data.spawn.z, data.spawn.w or 0.0),
        dropPoint = vec3(dropPointCoords.x, dropPointCoords.y, dropPointCoords.z),
        drawRadius = 60,
        useRadius = useDist,
        dropUseRadius = useDist + 0.5,
        drawMarker = data.drawMarker ~= false,
    }

    if data.blipEnabled ~= false then
        accessPoint.blip = {
            name = data.label,
            sprite = tonumber(data.blipSprite) or 357,
            color = tonumber(data.blipColor) or 3,
        }
    end

    local cfg = {
        label = data.label,
        vehicleType = data.vehicleType or VehicleType.CAR,
        groups = (data.groups and data.groups ~= '') and data.groups or nil,
        shared = data.shared == true,
        drawMarker = data.drawMarker ~= false,
        type = data.type == 'depot' and GarageType.DEPOT or nil,
        states = data.type == 'depot' and { VehicleState.OUT, VehicleState.IMPOUNDED } or nil,
        skipGarageCheck = data.type == 'depot' or nil,
        accessPoints = { accessPoint }
    }

    Garages[data.name] = cfg

    -- Broadcast update to all connected clients
    TriggerClientEvent('qbx_garages:client:garageRegistered', -1, data.name, cfg)

    TriggerClientEvent('ox_lib:notify', src, {
        title = 'Garage Manager',
        description = string.format("Garage '%s' successfully saved and synchronized!", data.label),
        type = 'success'
    })
end)

---Deletes a custom garage and removes it across all clients
---@param name string
RegisterNetEvent('qbx_garages:server:deleteGarage', function(name)
    local src = source
    if not isPlayerAdmin(src) then return end

    local customs = loadCustomGaragesFromFile()
    if customs[name] then
        customs[name] = nil
        saveCustomGaragesToFile(customs)
    end

    Garages[name] = nil
    TriggerClientEvent('qbx_garages:client:garageDeleted', -1, name)

    TriggerClientEvent('ox_lib:notify', src, {
        title = 'Garage Manager',
        description = string.format("Garage '%s' removed from server.", name),
        type = 'inform'
    })
end)

