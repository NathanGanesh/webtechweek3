exports.quote = function({text,attribution,id}) {
  return `
<a href="/${id}" class="quote img${id % 13}">
  <q>${text}</q>
  <address>${attribution}</address>
</a>
`;
};



exports.comment = function({text,userName,time}) {
  const timeHtml = time ? `<time>${new Date(time*1000).toLocaleString("nl-NL")}</time>` : ``;
  return `
<section class="comment">
  <aside>
    <address>${userName}</address>
    ${timeHtml}
  </aside>
  <p>${text}</p>
</section>
`;
};



exports.mainPage = function({quotes,userId,error}) {
  const content = `<main>${quotes.map(exports.quote).join('')}</main>`;
  return exports.page({userId, error, content});
};



exports.commentsPage = function({quote,comments,userId}) {
  let postHtml = !userId ? '' : `
<form class="comment" action="/${quote.id}/comments" method="post">
  <aside>You</aside>
  <textarea name="text"></textarea>
  <input type="submit" value="Post">
</form>
`;
  
  let content = `
<main>
  ${exports.quote(quote)}
  ${comments.map(exports.comment).join('')}
  ${postHtml}
</main>
`;
  return exports.page({title: quote.text, userId, content});
};



exports.page = function({userId,error,content,title}) {
  let links = userId ? `
<label class="link" for="quoteCheckbox">Add a quote</label>
<a class="link" href="/signout">Sign out</a>
` : `
<label class="link" for="signinCheckbox">Sign in</label>
`;

  return `
<!DOCTYPE html>
<html lang="en-US">
<head>
  <title>${title || "Quoter XP"}</title>
  <meta charset="utf-8">
  <link rel="stylesheet" type="text/css" href="style.css">
</head>

<body>

<header>
  <div class="title">
    <a class="home" href="/">Quoter XP</a>
    ${links}
  </div>
</header>
<input id="quoteCheckbox" type="checkbox" class="fake">

<div class="modal">
  <form action="/quotes" method="post">
    <h3>Quote</h3>
    <textarea name="text"></textarea>
    <h3>Attribution</h3>
    <input type="text" name="attribution">
    <label class="button cancel" for="quoteCheckbox">Cancel</label>
    <input type="submit" value="Add it!">
  </form>
</div>

<input id="signinCheckbox" type="checkbox" class="fake" ${error ? 'checked' : ''}>

<div class="modal">
  <form action="/signin" method="post">
    <p class="warn">WARNING: This site is intentionally insecure. Do not use passwords you may be using on other services.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <h3>Username</h3>
    <input type="text" name="username">
    <h3>Password</h3>
    <input type="password" name="password">
    <label class="button cancel" for="signinCheckbox">Cancel</label>
    <input type="submit" value="Sign in / Sign up">
  </form>
</div>

${content}

<script>
  addEventListener('scroll', function() {
    if (scrollY > 0) document.body.classList.add('scrolled');
    else document.body.classList.remove('scrolled');
  });
</script>

<span id="bottom"></span>

</body>
</html>
`;
};
