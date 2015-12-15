require.config({
    paths: {
        'jquery': '../vendor/jquery-2.1.4.min',
        'cloudTest': 'cloudTest'
　　}
});

requirejs(['cloudTest'], function(ct){
    ct.setup();
});
