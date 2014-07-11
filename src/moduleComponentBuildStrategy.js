(function() {
'use strict';

/**
 * @interface
 * @constructor
 */
function ModuleComponentBuildStrategy() {
}

/**
 * @param {ModuleIntrospector} introspector;
 * @param {$injector} injector;
 * @param {string} componentName
 * @param {...string=} dependency
 * @abstract
 */
ModuleComponentBuildStrategy.prototype.execute = angular.noop;



/**
 * @constructor
 * @extends ModuleComponentBuildStrategy
 *
 * @param {MockCreator} mockCreator
 * @param {string} moduleIntrospectorMethod the "get...Dependencies" method (i.e. "getServiceDependencies") to be used
 *  to query the dependencies of a module component.
 * @param {string} dependenciesUsage specifies if the (optional) dependencies argument provided when the "execute"
 *  method is invoked should be 'ignore', 'mocksFor' or 'mocksExcept'.
 */
function ModuleComponentWithMocksBuildStrategy(mockCreator, moduleIntrospectorMethod, dependenciesUsage) {
    this.mockCreator = mockCreator;
    this.moduleIntrospectorMethod = moduleIntrospectorMethod;
    this.dependenciesUsage = dependenciesUsage;
}

ModuleComponentWithMocksBuildStrategy.prototype.execute = function(introspector, injector, componentName, dependencies) {
    var invokeArgs = [];
    invokeArgs.length = toBeMockedDependencies.length + 1;

    introspector[this.moduleIntrospectorMethod].apply(introspector, invokeArgs);
};




function ActualModuleComponentBuildStrategy(introspectorComponentInfoQueryMethod) {
    this.
    this.introspectorComponentInfoQueryMethod = introspectorComponentInfoQueryMethod;
}

ActualModuleComponentBuildStrategy.prototype.execute = function(introspector, componentName) {
    var componentInfo = introspector[this.introspectorComponentInfoQueryMethod](componentName);

    if (!serviceInfo.declaration) {
        throw 'Could not find declaration of component with name: ' + serviceName;
    }

};



function MockedModuleComponentBuildStrategy() {

}


}());
