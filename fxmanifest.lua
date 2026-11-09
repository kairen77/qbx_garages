fx_version 'cerulean'
game 'gta5'

name 'qbx_garages'
description 'Garage system for Qbox with Custom NUI & Real-time Admin Manager'
repository 'https://github.com/kairen77/qbx_garages'
version '2.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@qbx_core/modules/lib.lua',
    'shared/*',
}

client_scripts {
    '@qbx_core/modules/playerdata.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/default-calculate-impound-fee.lua',
    'server/main.lua',
    'server/manager.lua',
    'server/spawn-vehicle.lua',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/**/*',
    'config/client.lua',
    'locales/*.json',
    'data/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
