/*
    count                敌机数量
    frameSpeed           敌群移动速度
    enemyTrackSpeed      敌机追踪速度
    enemyJumpFrequency   敌机跳出频率
    backgroundSpeed      背景移动速度
*/
let framesPerSecond = 45;

let levelData = [
    {
        barrier:"1-1",
        column:5,
        map: [
            0 , 1 , 0 , 1 , 0 ,
            1 , 1 , 1 , 1 , 1 ,
            0 , 1 , 1 , 1 , 0 ,
        ],
        frameSpeed: 60/framesPerSecond,
        enemyTrackSpeed: 70/framesPerSecond,
        enemyJumpFrequency: 60000/framesPerSecond,
        backgroundSpeed:12/framesPerSecond,
    },
    {
        barrier:"1-2",
        column:5,
        map: [
            0 , 2 , 0 , 2 , 0 ,
            1 , 1 , 1 , 1 , 1 ,
            0 , 1 , 1 , 1 , 0 ,
        ],
        frameSpeed: 60/framesPerSecond,
        enemyTrackSpeed: 70/framesPerSecond,
        enemyJumpFrequency: 60000/framesPerSecond,
        backgroundSpeed:18/framesPerSecond,
    },
    {
        barrier:"1-3",
        column:5,
        map: [
            0 , 2 , 2 , 2 , 0 ,
            1 , 1 , 1 , 1 , 1 ,
            0 , 1 , 1 , 1 , 0 ,
        ],
        frameSpeed: 65/framesPerSecond,
        enemyTrackSpeed: 75/framesPerSecond,
        enemyJumpFrequency: 65000/framesPerSecond,
        backgroundSpeed:24/framesPerSecond,
    },
    {
        barrier:"1-4",
        column:5,
        map: [
            0 , 2 , 3 , 2 , 0 ,
            1 , 1 , 1 , 1 , 1 ,
            0 , 1 , 1 , 1 , 0 ,
        ],
        frameSpeed: 65/framesPerSecond,
        enemyTrackSpeed: 75/framesPerSecond,
        enemyJumpFrequency: 65000/framesPerSecond,
        backgroundSpeed:30/framesPerSecond,
    },
    {
        barrier:"1-5",
        column:6,
        map: [
            0 , 3 , 0 , 0 , 3 , 0 ,
            2 , 1 , 1 , 1 , 1 , 2 ,
            0 , 1 , 1 , 1 , 1 , 0 ,
        ],
        frameSpeed: 65/framesPerSecond,
        enemyTrackSpeed: 75/framesPerSecond,
        enemyJumpFrequency: 65000/framesPerSecond,
        backgroundSpeed:30/framesPerSecond,
    },
    {
        barrier:"Boss战",
        column:6,
        map: [
            0 , 3 , 2 , 2 , 3 , 0 ,
            2 , 2 , 1 , 1 , 1 , 2 ,
            0 , 1 , 1 , 1 , 1 , 0 ,
        ],
        frameSpeed: 65/framesPerSecond,
        enemyTrackSpeed: 75/framesPerSecond,
        enemyJumpFrequency: 65000/framesPerSecond,
        backgroundSpeed:30/framesPerSecond,
    },
];