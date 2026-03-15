// ─── RANDOM MAPS ───
const MAP_TEMPLATES = [
    {
        name: 'Flat Meadow',
        getGround: () => ({ type: 'flat' }),
        p1y: 0, p2y: 0
    },
    {
        name: 'P1 Hilltop',
        getGround: () => ({ type: 'hill', hillSide: 'left' }),
        p1y: -100, p2y: 0
    },
    {
        name: 'P2 Hilltop',
        getGround: () => ({ type: 'hill', hillSide: 'right' }),
        p1y: 0, p2y: -100
    },
    {
        name: 'P1 Riverbank',
        getGround: () => ({ type: 'river', riverSide: 'left' }),
        p1y: 0, p2y: 0
    },
    {
        name: 'P2 Riverbank',
        getGround: () => ({ type: 'river', riverSide: 'right' }),
        p1y: 0, p2y: 0
    },
    {
        name: 'Valley',
        getGround: () => ({ type: 'valley' }),
        p1y: -70, p2y: -70
    },
];