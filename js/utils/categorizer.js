var App = window.App || {};
App.utils = App.utils || {};

(function () {
  var STORAGE_KEY_PREFIX = 'financial-dashboard-rules-';

  var DEFAULT_RULES = [
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

  var learnedRules = [];

  function getStorageKey() {
    var user = App.getState().user;
    return STORAGE_KEY_PREFIX + (user ? user.uid : 'anonymous');
  }

  function saveToStorage() {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(learnedRules));
    } catch (e) {
      console.warn('Failed to save rules to localStorage:', e);
    }
  }

  App.utils.categorizer = {
    categorize: function (description) {
      if (!description) {
        return { category: 'Uncategorized', business: 'Personal' };
      }

      var lower = description.toLowerCase();

      // Check learned rules first (user rules take priority)
      for (var i = 0; i < learnedRules.length; i++) {
        var rule = learnedRules[i];
        if (lower.indexOf(rule.keyword) !== -1) {
          return { category: rule.category, business: rule.business };
        }
      }

      // Then check default rules
      for (var j = 0; j < DEFAULT_RULES.length; j++) {
        var defRule = DEFAULT_RULES[j];
        for (var k = 0; k < defRule.keywords.length; k++) {
          if (lower.indexOf(defRule.keywords[k]) !== -1) {
            return { category: defRule.category, business: defRule.business };
          }
        }
      }

      return { category: 'Uncategorized', business: 'Personal' };
    },

    loadLearnedRules: function () {
      try {
        var stored = localStorage.getItem(getStorageKey());
        learnedRules = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.warn('Failed to load rules from localStorage:', e);
        learnedRules = [];
      }
      return learnedRules;
    },

    getLearnedRules: function () {
      return learnedRules.slice();
    },

    addLearnedRule: function (keyword, category, business) {
      var normalizedKeyword = keyword.toLowerCase().trim();

      // Check for duplicate keyword — update if exists
      var existing = learnedRules.findIndex(function (r) {
        return r.keyword === normalizedKeyword;
      });

      if (existing !== -1) {
        learnedRules[existing] = Object.assign({}, learnedRules[existing], {
          category: category,
          business: business
        });
      } else {
        learnedRules.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          keyword: normalizedKeyword,
          category: category,
          business: business,
          createdAt: new Date().toISOString()
        });
      }

      saveToStorage();
    },

    removeLearnedRule: function (ruleId) {
      learnedRules = learnedRules.filter(function (r) { return r.id !== ruleId; });
      saveToStorage();
    },

    getDefaultRules: function () {
      return DEFAULT_RULES.map(function (rule) {
        return Object.assign({}, rule);
      });
    },

    // Extract a likely vendor keyword from a description
    extractKeyword: function (description) {
      if (!description) return '';
      var cleaned = description
        .replace(/^(card payment|payment to|transfer to|transfer from|direct debit|standing order|from|to)\s*/i, '')
        .replace(/\s*(ltd|limited|inc|llc|pty|gmbh|co\.?)\s*$/i, '')
        .replace(/\d{4,}/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return cleaned.toLowerCase();
    },

    // Group transactions by similar description for bulk categorize
    groupUncategorized: function (transactions) {
      var groups = {};

      transactions.forEach(function (tx) {
        if (tx.category && tx.category !== 'Uncategorized') return;

        var keyword = App.utils.categorizer.extractKeyword(tx.description);
        if (!keyword) return;

        if (!groups[keyword]) {
          groups[keyword] = {
            keyword: keyword,
            description: tx.description,
            transactions: [],
            totalAmount: 0,
            type: tx.type
          };
        }
        groups[keyword].transactions.push(tx);
        groups[keyword].totalAmount += tx.amount;
      });

      return Object.values(groups).sort(function (a, b) {
        return b.transactions.length - a.transactions.length;
      });
    }
  };
})();
