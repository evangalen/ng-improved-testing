describe('$injector service', function() {
    'use strict';

    /** @const */
    var filter = function(text) {
        return text + '!';
    };

    /** @const */
    var filterFactory = function() {
        return filter;
    };

    /** @const */
    var directive = {
        restrict: 'E',
        template: '<span></span>'
    };

    /** @const */
    var directiveFactory = function() {
        return directive;
    };

    /** @constructor */
    function ControllerConstructor() {
    }

    /** @const */
    var moduleInstance = angular.module('angularInjectorLearningSpecModule', [])
        .filter('aFilter', filterFactory)
        .directive('aDirective', directiveFactory)
        .controller('aController', ControllerConstructor);


    var $provide;
    var $filterProvider;
    var $compileProvider;
    var $controllerProvider;


    beforeEach(module('ng', function(_$provide_, _$filterProvider_, _$compileProvider_, _$controllerProvider_) {
        $provide = _$provide_;
        spyOn($provide, 'constant').andCallThrough();
        spyOn($provide, 'value').andCallThrough();
        spyOn($provide, 'service').andCallThrough();
        spyOn($provide, 'factory').andCallThrough();
        spyOn($provide, 'provider').andCallThrough();

        $filterProvider = _$filterProvider_;
        spyOn($filterProvider, 'register').andCallThrough();

        $compileProvider = _$compileProvider_;
        spyOn($compileProvider, 'directive').andCallThrough();

        $controllerProvider = _$controllerProvider_;
        spyOn($controllerProvider, 'register').andCallThrough();
    }, moduleInstance.name));

    afterEach(function() {
        expect($provide.constant.calls.length).toBe(0);
        expect($provide.value.calls.length).toBe(0);
        expect($provide.service.calls.length).toBe(0);
        expect($provide.provider.calls.length).toBe(0);
    });


    var $injector;

    beforeEach(inject(function(_$injector_) {
        $injector = _$injector_;
    }));



    describe("get method", function() {

        it('should return a filter using its filter name + "Filter" suffix', function() {
            expect($filterProvider.register).toHaveBeenCalledWith('aFilter', filterFactory);
            expect($provide.factory).toHaveBeenCalledWith('aFilterFilter', filterFactory);

            expect($injector.get('aFilterFilter')).toBe(filter);

        });

        it('should return an array containing the directive using its directive name + "Directive" suffix', function() {
            expect($compileProvider.directive).toHaveBeenCalledWith('aDirective', directiveFactory);

            var invocationIndex = -1;

            for (var i = 0; i < $provide.factory.calls.length; i++) {
                if ($provide.factory.calls[i].args[0] === 'aDirectiveDirective') {
                    expect(invocationIndex).toBe(-1);

                    invocationIndex = i;
                }
            }

            expect(invocationIndex !== -1).toBe(true);
            expect($provide.factory.calls[invocationIndex].args.length).toBe(2);

            expect($injector.get('aDirectiveDirective')).toEqual([directive]);
        });

        it('should return an animation using its animation name + "-animation" suffix', function() {
            //TODO: ...
        });

        //TODO: this spec isn't actually testing "$injector#get" !!!
        it('should "not" return an Controller using its controller name as part of the service name', function() {
            expect($controllerProvider.register).toHaveBeenCalledWith('aController', ControllerConstructor);

            //TODO: instead of this solution let the others specs 'register' its "expected" factory invocations
            //  and then check in the "afterEach" that only these factory invocations has been made
            for (var i = 0; i < $provide.factory.calls.length; i++) {
                expect($provide.factory.calls[i].args[0].indexOf('aController')).toBe(-1);
            }
        });
    });


    describe("has method", function() {

        it('should find a filter using its filter name + "Filter" suffix', function() {
            expect($injector.has('aFilterFilter')).toBe(true);
        });

        it('should find a directive using its directive name + "Directive" suffix', function() {
            expect($injector.has('aDirectiveDirective')).toBe(true);
        });

        it('should find an animation using its animation name + "-animation" suffix', function() {

        });
    });

});

