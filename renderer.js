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

window.electronAPI.setPage((event, value) => {
  const {content} = value;
  const root = document.getElementById("root")
  root.innerHTML = content
})