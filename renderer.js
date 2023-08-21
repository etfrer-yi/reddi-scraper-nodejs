const submitButton = document.getElementById('btn')

submitButton.addEventListener('click', () => {
  const formData = {
    subredditName: document.getElementById('subreddit').value,
    filterParams: document.getElementById("filterParams").value
  }
  window.electronAPI.setSubredditInfo(formData)
  // const spinner = "<div class='loader'></div>";
  // const root = document.getElementById("root");
  // root.innerHTML = spinner;
})

window.electronAPI.setLoadingScreen((event, value) => {
  location.href='loading.html'
})

window.electronAPI.setWordCounts((event, value) => {
  location.href='graphics.html'
})