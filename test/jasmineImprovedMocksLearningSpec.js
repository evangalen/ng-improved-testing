describe('jasmine improved mocks learning', function() {
    'use strict';

    it('how to shadow an object literal with a mock object', function() {
        var toBeMockedObjectLiteral = {
            aPrimitive: 'originalValue',
            aMethod: function() { throw 'Should have been shadowed by a jasmine spy'; }
        };

        /** @constructor */
        function Mock() {
            // make a copy of each property... primitives can be copied as is... where objects need a deep copy
            this.aPrimitive = 'originalValue';

            // create a spy one
            spyOn(this, 'aMethod').andCallFake(function() {
                this.aPrimitive = 'modifiedValue';
            });
        }

        Mock.prototype = Object.create(toBeMockedObjectLiteral);

        // make sure that a `console.log(mockInstance)` prints 'Mock{...}' instead of 'OriginalConstructor{...}'
        Mock.prototype.constructor = Mock;

        // the "new Mock()" should be done by (jasmineImprovedMocks.)mockInstance(<original-instance>)
        var mockInstance = new Mock();

        expect(mockInstance instanceof Object).toBe(true);

        expect(Object.getPrototypeOf(Object.getPrototypeOf(mockInstance))).toBe(toBeMockedObjectLiteral);

        mockInstance.aMethod();
        expect(mockInstance.aPrimitive).toBe('modifiedValue');
        expect(toBeMockedObjectLiteral.aPrimitive).toBe('originalValue');
    });

    it('how to show an object created by a constructor function with a mock object', function() {
        function OriginalConstructor() {
            this.aPrimitive = 'originalValue';
            this.methodAddedInConstructor = function() { throw 'Should have been shadowed by a jasmine spy'; };
        }

        OriginalConstructor.prototype.methodAddedOnPrototype =
            function() {
                throw 'Should have been shadowed by a jasmine spy';
            };

        var toBeMockedObjectCreatedByConstructor = new OriginalConstructor();


        /** @constructor */
        function Mock() {
            // make a copy of each property ("also" the inherited ones)... primitives can be copied as is...
            // where objects need a deep copy
            this.aPrimitive = 'originalValue';

            // make a spy of each method added in the constructor (that not on the prototype itself)
            spyOn(this, 'methodAddedInConstructor');
        }

        Mock.prototype = Object.create(toBeMockedObjectCreatedByConstructor);

        // make sure that a `console.log(mockInstance)` prints 'Mock{...}' instead of 'OriginalConstructor{...}'
        Mock.prototype.constructor = Mock;

        // make a spy of each method added in the prototype of the constructor
        spyOn(Mock.prototype, 'methodAddedOnPrototype').andCallFake(function() {
            this.aPrimitive = 'modifiedValue';
        });


        // the "new Mock()" should be done by (jasmineImprovedMocks.)mockInstance(<original-instance>)
        var mockInstance = new Mock();

        expect(mockInstance instanceof OriginalConstructor).toBe(true);
        expect(mockInstance instanceof Mock).toBe(true);
        mockInstance.methodAddedInConstructor();
        mockInstance.methodAddedOnPrototype();
        expect(mockInstance.aPrimitive).toBe('modifiedValue');
        expect(toBeMockedObjectCreatedByConstructor.aPrimitive).toBe('originalValue');
    });

    it('how to create a mock for a (non instantiated) constructor', function() {
        function OriginalConstructor() {
            this.aPrimitive = 'originalValue';
            this.methodAddedInConstructor = function() { throw 'Should have been shadowed by a jasmine spy'; };
        }

        // !!!static methods will NOT be mocked!!!
        OriginalConstructor.aStaticMethod = function() {};

        OriginalConstructor.prototype.methodAddedOnPrototype =
            function() {
                throw 'Should have been shadowed by a jasmine spy';
            };


        /** @constructor */
        function Mock() {
            // invoke the original constructor
            OriginalConstructor.apply(this, arguments);

            // replace all (own) methods on this (and NOT of the prototype chain) with a spyOn
            spyOn(this, 'methodAddedInConstructor');
        }

        Mock.prototype = Object.create(OriginalConstructor.prototype); // differs from mocks based on instances

        // make sure that a `console.log(mockInstance)` prints 'Mock{...}' instead of 'OriginalConstructor{...}'
        Mock.prototype.constructor = Mock;

        // make a spy of each method added in the prototype of the constructor
        spyOn(Mock.prototype, 'methodAddedOnPrototype').andCallFake(function() {
            this.aPrimitive = 'modifiedValue';
        });


        // the "new Mock()" should be done by (jasmineImprovedMocks.)mock(<constructor-fn>, [<constructor-args>+])
        var mockInstance = new Mock();


        mockInstance.methodAddedInConstructor();
        mockInstance.methodAddedOnPrototype();
        expect(mockInstance.aPrimitive).toBe('modifiedValue');
    });

    it('how to create a mock from (possible) constructor function', function() {
        function PossibleConstructor() {
        }

        var SpyConstructor = jasmine.createSpy();
        SpyConstructor.prototype = Object.create(PossibleConstructor.prototype, {constructor: PossibleConstructor});

        SpyConstructor.andReturn(42);

        expect(SpyConstructor.call(undefined)).toBe(42);

        SpyConstructor.reset();

        expect(new SpyConstructor() instanceof PossibleConstructor).toBe(true);
    });



    var $provide;
    var $controllerProvider;

    beforeEach(module(function(_$provide_, _$controllerProvider_) {
        $provide = _$provide_;
        spyOn($provide, 'factory').andCallThrough();
        spyOn($provide, 'service').andCallThrough();

        $controllerProvider = _$controllerProvider_;
        spyOn($controllerProvider, 'register').andCallThrough();
    }, 'ngImprovedTesting'));


//    it('ddssd', inject(function() {
//        console.log($provide.service.argsForCall);
//        console.log($provide.factory.argsForCall);
//    }));
});
