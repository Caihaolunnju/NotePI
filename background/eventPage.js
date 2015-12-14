require.config({
    baseUrl:'background', // 这里指定了baseUrl是为了方便background下的各子模块方便加载
    paths: {
        'cloudSetup': 'cloudSetup'
　　}
});

requirejs(['cloudSetup'], function(cs){
    cs.setup();
});
