(function() {
'use strict';

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

    this.execute = function(introspector, injector, componentName, dependencies) {
        var componentDependencies = introspector[this.moduleIntrospectorMethod].apply(introspector, componentName);

        var annotatedService = [];

        angular.forEach(componentDependencies, function (componentDependencyInfo, componentDependencyName) {
            var toBeMocked = mockCreator.canBeMocked(componentDependencyInfo.instance);

            if (toBeMocked) {
                toBeMockedServices.push(serviceDependencyName);
            } else {
                nonMockServiceDependencies.push(serviceDependencyName);
            }

            annotatedService.push(serviceDependencyName + (toBeMocked ? 'Mock' : ''));
        });
    };
}

ModuleComponentWithMocksBuildStrategy.prototype.execute = function(
        introspector, injector, componentName, dependencies) {

    var invokeArgs = [];
    invokeArgs.length = toBeMockedDependencies.length + 1;




    var serviceDeclaration = introspector.getServiceDeclaration(serviceName);

    var originalNonAnnotatedServiceDeclaration;
    if (angular.isArray(serviceDeclaration.declaration)) {
        originalNonAnnotatedServiceDeclaration =
            serviceDeclaration.declaration[serviceDeclaration.declaration.length - 1];
    } else {
        originalNonAnnotatedServiceDeclaration = serviceDeclaration.declaration;
    }

    annotatedService.push(originalNonAnnotatedServiceDeclaration);

    buildModule[serviceDeclaration.providerMethod](serviceName, annotatedService);


};

}());
