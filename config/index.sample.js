module.exports = {
    APP_PORT: 9098,
    APP_NAME: "Lock Screen",
    APP_URL: "http://localhost:9098",
    LockScreenSource: "C:\\Windows\\System32",
    excludeComputers: [
        {
            username: "Ilias.Aidar",
            computername: "PC-038"
        }
    ],
    branches: [
        {
            name: "Public",
            network: [],
            images: [ // files should be located in public/images folder
                'img001.jpg',
                'img002.jpg',
            ]
        },
        {
            name: "CO",
            network: ['192.168.44'],
            images: [ // files should be located in public/images folder
                'co_img001.jpg',
                'co_img002.jpg',
                'co_img003.jpg',
                'co_img004.jpg'
            ]
        }
        // you can add more branches )
    ]
}