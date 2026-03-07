export function generateBookmarkletCode(appOrigin: string, sessionToken: string): string {
  // This JavaScript runs in the user's browser on x.com (same-origin)
  const code = `
(async function() {
  const APP_ORIGIN = "${appOrigin}";
  const TOKEN = "${sessionToken}";

  function toast(msg) {
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:12px 20px;background:#1a1a2e;color:#c9a84c;border:1px solid #c9a84c;border-radius:8px;font-family:serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 4000);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  toast('🎲 Scrying spell cast... gathering data...');

  // Auto-scroll to load tweets
  for (let i = 0; i < 5; i++) {
    window.scrollBy(0, window.innerHeight * 2);
    await sleep(1500);
  }
  window.scrollTo(0, 0);
  await sleep(500);

  // Collect profile data
  const nameEl = document.querySelector('[data-testid="UserName"]');
  const bioEl = document.querySelector('[data-testid="UserDescription"]');
  const handle = window.location.pathname.replace('/', '').split('/')[0] || '';

  let displayName = '';
  if (nameEl) {
    const spans = nameEl.querySelectorAll('span');
    displayName = spans[0]?.textContent || '';
  }

  const bio = bioEl?.textContent || '';

  // Location and join date
  const profileHeaderItems = document.querySelectorAll('[data-testid="UserProfileHeader_Items"] span');
  let location = '';
  let joinDate = '';
  profileHeaderItems.forEach(el => {
    const text = el.textContent || '';
    if (text.startsWith('Joined ')) joinDate = text.replace('Joined ', '');
    else if (!text.startsWith('@') && text.length > 1 && !text.includes('Born')) location = text;
  });

  // Follower/following counts
  const links = document.querySelectorAll('a[href*="/followers"], a[href*="/following"], a[href*="/verified_followers"]');
  let followersCount = 0;
  let followingCount = 0;
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent || '';
    const num = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    if (text.includes('K')) {
      const m = text.match(/([0-9.]+)K/);
      if (m) {
        if (href.includes('following')) followingCount = Math.round(parseFloat(m[1]) * 1000);
        else followersCount = Math.round(parseFloat(m[1]) * 1000);
        return;
      }
    }
    if (text.includes('M')) {
      const m = text.match(/([0-9.]+)M/);
      if (m) {
        if (href.includes('following')) followingCount = Math.round(parseFloat(m[1]) * 1000000);
        else followersCount = Math.round(parseFloat(m[1]) * 1000000);
        return;
      }
    }
    if (href.includes('following')) followingCount = num;
    else if (href.includes('follower')) followersCount = num;
  });

  // Collect tweets
  const tweetEls = document.querySelectorAll('[data-testid="tweet"]');
  const tweets = [];
  let pinnedTweet = null;

  tweetEls.forEach((tweetEl, idx) => {
    const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
    const text = textEl?.textContent || '';
    if (!text) return;

    // Check if pinned
    const socialContext = tweetEl.querySelector('[data-testid="socialContext"]');
    if (socialContext?.textContent?.includes('Pinned') && !pinnedTweet) {
      pinnedTweet = text;
    }

    // Check reply/retweet
    const isReply = !!tweetEl.querySelector('[data-testid="Tweet-User-Avatar"]')?.closest('[data-testid="tweet"]')?.querySelector('div[dir] > span')?.textContent?.includes('Replying to');
    const isRetweet = !!socialContext?.textContent?.includes('reposted');

    // Engagement metrics
    const likeBtn = tweetEl.querySelector('[data-testid="like"] span, [data-testid="unlike"] span');
    const rtBtn = tweetEl.querySelector('[data-testid="retweet"] span, [data-testid="unretweet"] span');
    const replyBtn = tweetEl.querySelector('[data-testid="reply"] span');

    function parseCount(el) {
      if (!el) return 0;
      const t = el.textContent || '';
      if (t.includes('K')) return Math.round(parseFloat(t) * 1000);
      if (t.includes('M')) return Math.round(parseFloat(t) * 1000000);
      return parseInt(t) || 0;
    }

    // Timestamp
    const timeEl = tweetEl.querySelector('time');
    const timestamp = timeEl?.getAttribute('datetime') || '';

    tweets.push({
      text: text.slice(0, 500),
      isReply: isReply || false,
      isRetweet: isRetweet || false,
      isThread: false,
      likesReceived: parseCount(likeBtn),
      retweetsReceived: parseCount(rtBtn),
      repliesReceived: parseCount(replyBtn),
      timestamp
    });
  });

  // Compute derived fields
  const tweetTexts = tweets.map(t => t.text);

  // Top mentions
  const mentionFreq = {};
  tweetTexts.forEach(t => {
    (t.match(/@\\w+/g) || []).forEach(m => {
      const h = m.toLowerCase();
      mentionFreq[h] = (mentionFreq[h] || 0) + 1;
    });
  });
  const topMentions = Object.entries(mentionFreq).sort((a,b) => b[1] - a[1]).slice(0,5).map(e => e[0]);

  // Most used words
  const stopWords = new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us','is','are','was','were','been','has','had','did','does','am','rt','im','dont','ive']);
  const wordFreq = {};
  tweetTexts.forEach(t => {
    t.toLowerCase().replace(/https?:\\/\\/\\S+/g, '').replace(/[^a-z\\s]/g, '').split(/\\s+/).filter(w => w.length > 2 && !stopWords.has(w)).forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });
  const mostUsedWords = Object.entries(wordFreq).sort((a,b) => b[1] - a[1]).slice(0,10).map(e => e[0]);

  // Avg engagement rate
  let avgEngagement = 0;
  if (tweets.length > 0 && followersCount > 0) {
    const totalEng = tweets.reduce((s, t) => s + t.likesReceived + t.retweetsReceived + t.repliesReceived, 0);
    avgEngagement = totalEng / tweets.length / followersCount;
  }

  const profile = {
    handle,
    displayName,
    bio,
    location,
    joinDate,
    followersCount,
    followingCount,
    tweetCount: tweets.length,
    pinnedTweet,
    recentTweets: tweets.slice(0, 30),
    topMentions,
    mostUsedWords,
    avgEngagementRate: avgEngagement,
    completeness: 'full'
  };

  // Send to app via hidden iframe form (bypasses CSP fetch restrictions)
  try {
    const iframe = document.createElement('iframe');
    iframe.name = 'xdnd_submit';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = APP_ORIGIN + '/api/receive';
    form.target = 'xdnd_submit';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify({ token: TOKEN, profile });
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    form.remove();

    toast('✨ Scrying complete! Return to Roll for Profile.');
    setTimeout(() => iframe.remove(), 5000);
  } catch(e) {
    toast('⚠️ Error sending data: ' + e.message);
  }
})();
  `.trim();

  return `javascript:${encodeURIComponent(code)}`;
}
