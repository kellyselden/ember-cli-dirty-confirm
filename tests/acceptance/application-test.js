import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import sinon from 'sinon';

let sandbox;
let confirmStub;

moduleForAcceptance('Acceptance | application', {
  beforeEach() {
    sandbox = sinon.sandbox.create();

    confirmStub = sandbox.stub(window, 'confirm');
  },
  afterEach() {
    sandbox.restore();
  }
});

test('allows leaving page if nothing changed', function(assert) {
  visit('/1');

  click('#cancel');

  andThen(function() {
    assert.equal(currentURL(), '/');

    assert.notOk(confirmStub.called);
  });

  visit('/1');

  andThen(function() {
    assert.equal(find('#name').val(), 'Test product');
  });
});

test('stops you and lets you continue editing', function(assert) {
  visit('/1');

  fillIn('#name', 'Test product 2');

  confirmStub.returns(false);

  click('#cancel');

  andThen(function() {
    assert.equal(currentURL(), '/1');

    assert.equal(find('#name').val(), 'Test product 2');

    assert.ok(confirmStub.calledOnce);
  });
});

test('rolls back your model and takes you back', function(assert) {
  visit('/1');

  fillIn('#name', 'Test product 2');

  confirmStub.returns(true);

  click('#cancel');

  andThen(function() {
    assert.equal(currentURL(), '/');

    assert.ok(confirmStub.calledOnce);
  });

  visit('/1');

  andThen(function() {
    assert.equal(find('#name').val(), 'Test product');
  });
});
