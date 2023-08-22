const submitButton = document.getElementById('btn')

if (submitButton) {
  submitButton.addEventListener('click', async () => {
    const formData = {
      subredditName: document.getElementById('subreddit').value,
      filterParams: document.getElementById("filterParams").value
    }
    window.electronAPI.setSubredditInfo(formData)
  })
}

window.electronAPI.setLoadingScreen((event, value) => {
  const {file, allPosts} = value;
  window.location.href = file
})