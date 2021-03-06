/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

anysdk.agentManager = anysdk.AgentManager.getInstance();

anysdk.callWrapper = function(plugin, func){
    plugin[func.name] = (function(){
        var params = [];
        if(arguments){
            var l = arguments.length;
            for (var i = 0; i < l; i++) {
                var arg = arguments[i];
                var param = anysdk.PluginParam.create(arg);
                params.push(param);
            }
        }
                         
        if(this.returnType == "void"){
            plugin.callFuncWithParam(this.name, params);
        }else if(this.returnType == "boolean"){
            return plugin.callBoolFuncWithParam(this.name, params);
        }else if(this.returnType == "int"){
            return plugin.callIntFuncWithParam(this.name, params);
        }else if(this.returnType == "float"){
            return plugin.callFloatFuncWithParam(this.name, params);
        }else {
            return plugin.callStringFuncWithParam(this.name, params);
        }
    }).bind(func);
}

anysdk.parseData = function(data){
    var jsonData = [];
    var substring = data.substring(1, data.length - 2)
    var array = substring.split(",");
    for (var i = 0; i < array.length; i++ ){
        var functionData = array[i].split("&");
        var funcParam = {};
        for(var j = 0; j < functionData.length; j++){
            var itemData = functionData[j].split("=");
            if(itemData.length > 1)
            {
                funcParam[itemData[0]] = itemData[1];
            }
        }
        jsonData.push(funcParam)
        
    }
    return jsonData;
}

anysdk.registerAPIs = function(plugin) {
    var functionString = anysdk.JSBRelation.getMethodsOfPlugin(plugin);
    var data = anysdk.parseData(functionString);
    for (var i = 0; i < data.length; i++ ){
        var name =  data[i].name;
        if(name && !plugin[name]){
            cc.log("plugin: " + name + " auto binding");
            anysdk.callWrapper(plugin, data[i]);
        }
    }
}
anysdk.agentManager._loadAllPlugins = anysdk.agentManager.loadAllPlugins;
anysdk.agentManager.loadAllPlugins = function (callback, target) {
    anysdk.agentManager._loadAllPlugins();
    if(callback){
        if (target){
            callback.call(target, 0, "loadAllPlugins finish");
        }else{
            callback(0, "loadAllPlugins finish");
        }
    }
}

anysdk.agentManager._getUserPlugin = anysdk.agentManager.getUserPlugin;
anysdk.agentManager.getUserPlugin = function () {
    var plugin = this._getUserPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.isInitialized = true;
        plugin.setListener = function(callback, target){
            var onUserResult = function(plugin, code, msg){
                if (target){
                    callback.call(target, code, msg);
                }else{
                    callback(code, msg);
                }           
            }
            plugin.setActionListener(onUserResult,this);
        };
    }
    return plugin;
}

anysdk.ProtocolIAP = anysdk.ProtocolYAP;
anysdk.ProtocolIAP.resetPayState = anysdk.ProtocolYAP.resetYapState;
anysdk.agentManager._getIAPPlugin = anysdk.agentManager.getYAPPlugin;
anysdk.agentManager.getIAPPlugins = function () {
    var plugins = this._getIAPPlugin();
    if (plugins) {
        for (var item in plugins){
            if (plugins.hasOwnProperty(item)){
                var plugin = plugins[item];
                if (!plugin.isInitialized) {
                    anysdk.registerAPIs(plugin);
                    plugin.setListener = plugin.setResultListener;
                    plugin.payForProduct = plugin.yapForProduct;
                    plugin.isInitialized = true;
                }
            }
        };  
    }; 
    return plugins;
}

anysdk.agentManager.getIAPPlugin = function () {
    var iapPlugins = anysdk.agentManager.getIAPPlugins();
    if(iapPlugins != null){
        for(var item in iapPlugins){
            if (iapPlugins.hasOwnProperty(item)) {
               return iapPlugins[item]; 
            }  
        }
    }
    return null;
}


anysdk.agentManager._getAdsPlugin = anysdk.agentManager.getAdsPlugin;
anysdk.agentManager.getAdsPlugin = function () {
    var plugin = this._getAdsPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.setListener = plugin.setAdsListener;
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getSocialPlugin = anysdk.agentManager.getSocialPlugin;
anysdk.agentManager.getSocialPlugin = function () {
    var plugin = this._getSocialPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getSharePlugin = anysdk.agentManager.getSharePlugin;
anysdk.agentManager.getSharePlugin = function () {
    var plugin = this._getSharePlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.setListener = plugin.setResultListener;
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getPushPlugin = anysdk.agentManager.getPushPlugin;
anysdk.agentManager.getPushPlugin = function () {
    var plugin = this._getPushPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.setListener = plugin.setActionListener;
        plugin.isInitialized = true;
        plugin.setListener = function(callback, target){
            var onPushResult = function(plugin, code, msg){
                if (target){
                    callback.call(target, code, msg);
                }else{
                    callback(code, msg);
                }           
            }
            plugin.setActionListener(onPushResult,this);
        };
    }
    return plugin;
}

anysdk.agentManager._getAnalyticsPlugin = anysdk.agentManager.getAnalyticsPlugin;
anysdk.agentManager.getAnalyticsPlugin = function () {
    var plugin = this._getAnalyticsPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getRECPlugin = anysdk.agentManager.getRECPlugin;
anysdk.agentManager.getRECPlugin = function () {
    var plugin = this._getRECPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.setListener = plugin.setResultListener;
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getCustomPlugin = anysdk.agentManager.getCustomPlugin;
anysdk.agentManager.getCustomPlugin = function () {
    var plugin = this._getCustomPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.setListener = plugin.setResultListener;
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getCrashPlugin = anysdk.agentManager.getCrashPlugin;
anysdk.agentManager.getCrashPlugin = function () {
    var plugin = this._getCrashPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.isInitialized = true;
    }
    return plugin;
}

anysdk.agentManager._getAdTrackingPlugin = anysdk.agentManager.getAdTrackingPlugin;
anysdk.agentManager.getAdTrackingPlugin = function () {
    var plugin = this._getAdTrackingPlugin();
    if (plugin && !plugin.isInitialized) {
        anysdk.registerAPIs(plugin);
        plugin.onPay = plugin.onYap;
        plugin.isInitialized = true;
    }
    return plugin;
}
