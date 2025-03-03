module.exports = {
    // Custom label filter to mark only ad products.
    adAllowed: {
        categoryName: [
            'Снеки',
            'Орехи',
            'Сухофрукты и цукаты',
            'Пряности и специи'
        ],
        productID: []
    },

    // Filters to apart products on 2 feed files - ad and free.
    adAllowedList: ['103472456301', '850550835561', '630090046341'],

    excludeIDList: [
        '114154157311',
        '778465479011',
        '317305176871',
        '307797719391',
        '807024382141',
        '116144529091',
        '859724509061',
        '104609093451'
    ],

    stopWords: ['Milka', 'Nutella', 'Pringles', 'Ice Cool'],

    stopCategories: ['Сыры и молочная продукция'],

    priceLowerBoundry: 100,

    violationOfGooglePoliciesIDList: [
        '517492549551',
        '102471993071',
        '981767622631',
        '339490653051',
        '737347491661',
        '525627747981',
        '300487713811',
        '465479619161',
        '304466481741',
        '509025801971',
        '541498183601',
        '113858741161',
        '732639422151',
        '588697690471',
        '263582868301',
        '369184577821',
        '681462501671',
        '719458616201',
        '926307111781'
    ],

    tooLongDescription: {
        IDList: [
            '153514378861',
            '157312445711',
            '286391067601',
            '140606858921',
            '526193240321'
        ],
        truncate(text) {
            return `${text.slice(0, 300)}...`
        }
    },

    excessiveCapitalizationIDList: [
        '747513344761',
        '965828636571',
        '641289309261'
    ]
}
