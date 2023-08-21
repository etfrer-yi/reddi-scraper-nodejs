const submitButton = document.getElementById('btn')
submitButton.addEventListener('click', () => {
  const formData = {
    subredditName: document.getElementById('subreddit').value,
    filterParams: document.getElementById("filterParams").value
  }
  window.electronAPI.setSubredditInfo(formData)
})
