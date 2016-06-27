var _ = require('underscore');

module.exports = function(RED) {

  var extractEmail = function(sentence) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    var matched = sentence.match(re);
    return matched != null ? matched[0] : null;
  };

  function ChatBotParse(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.parseType = config.parseType;
    this.parseVariable = config.parseVariable;

    this.on('input', function(msg) {

      var parseType = this.parseType;
      var parseVariable = this.parseVariable;
      var context = node.context();

      var parsedValue = null;

      switch(parseType) {
        case 'string':
          parsedValue = msg.payload.content;
          break;
        case 'email':
          parsedValue = extractEmail(msg.payload.content);
          break;
        case 'location':
          if (_.isObject(msg.payload.content) && msg.payload.content.latitude && msg.payload.content.longitude) {
            parsedValue = msg.payload.content;
          }
          break;
      }

      // if parsing ok, then pass through and set variable in context flow
      if (parsedValue != null) {
        context.flow.set(parseVariable, parsedValue);
        node.send([msg, null]);
      } else {
        node.send([null, msg]);
      }

    });
  }
  RED.nodes.registerType('chatbot-parse', ChatBotParse);

};