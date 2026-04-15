var App = window.App || {};
App.utils = App.utils || {};

(function () {
  var RULES = [
    // Tech Work
    { keywords: ['anthropic', 'claude'], category: 'Claude API', business: 'Tech Work' },
    { keywords: ['aws', 'amazon web services', 'amazon.com services'], category: 'AWS', business: 'Tech Work' },
    { keywords: ['namecheap', 'godaddy', 'cloudflare', 'hover.com', 'domainr'], category: 'Domains', business: 'Tech Work' },
    { keywords: ['github', 'digitalocean', 'heroku', 'vercel', 'netlify', 'lightsail'], category: 'Hosting', business: 'Tech Work' },
    { keywords: ['openai', 'replicate'], category: 'AI Services', business: 'Tech Work' },

    // Freediving Work
    { keywords: ['ssi', 'scuba schools', 'padi'], category: 'Certifications', business: 'Freediving Work' },
    { keywords: ['aida', 'freediving'], category: 'Freediving', business: 'Freediving Work' },
    { keywords: ['molchanov', 'alchemy', 'lobster', 'cressi', 'mares', 'suunto'], category: 'Equipment', business: 'Freediving Work' }
  ];

  App.utils.categorizer = {
    categorize: function (description) {
      if (!description) {
        return { category: 'Uncategorized', business: 'Personal' };
      }

      var lower = description.toLowerCase();

      for (var i = 0; i < RULES.length; i++) {
        var rule = RULES[i];
        for (var j = 0; j < rule.keywords.length; j++) {
          if (lower.indexOf(rule.keywords[j]) !== -1) {
            return { category: rule.category, business: rule.business };
          }
        }
      }

      return { category: 'Uncategorized', business: 'Personal' };
    },

    getRules: function () {
      return RULES.map(function (rule) {
        return Object.assign({}, rule);
      });
    }
  };
})();
