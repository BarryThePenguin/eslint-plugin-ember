'use strict';

const utils = require('../utils/utils');
const types = require('../utils/types');
const ember = require('../utils/ember');

//------------------------------------------------------------------------------
// General rule - Don’t use jQuery without Ember Run Loop
//------------------------------------------------------------------------------

const isJqueryUsed = function (node) {
  return (
    types.isMemberExpression(node) &&
    types.isCallExpression(node.object) &&
    ember.isModule(node.object, '$')
  );
};

const isRunUsed = function (node) {
  return ember.isModule(node, 'run');
};

const ERROR_MESSAGE = "Don't use jQuery without Ember Run Loop";

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow usage of jQuery without an Ember run loop',
      category: 'jQuery',
      recommended: true,
      url:
        'https://github.com/ember-cli/eslint-plugin-ember/tree/master/docs/rules/jquery-ember-run.md',
    },
    fixable: null,
    schema: [],
  },

  ERROR_MESSAGE,

  create(context) {
    const report = function (node) {
      context.report(node, ERROR_MESSAGE);
    };

    return {
      CallExpression(node) {
        const callee = node.callee;
        const fnNodes = utils.findNodes(node.arguments, 'ArrowFunctionExpression');

        if (isJqueryUsed(callee) && fnNodes.length > 0) {
          fnNodes.forEach((fnNode) => {
            const fnBody = fnNode.body.body;
            const fnExpressions = utils.findNodes(fnBody, 'ExpressionStatement');

            fnExpressions.forEach((fnExpression) => {
              const expression = fnExpression.expression;

              if (
                types.isCallExpression(expression) &&
                types.isMemberExpression(expression.callee) &&
                !isRunUsed(expression)
              ) {
                report(expression.callee);
              }
            });
          });
        }
      },
    };
  },
};
