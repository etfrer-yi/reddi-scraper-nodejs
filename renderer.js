const submitButton = document.getElementById('btn')
const body = document.body;

const getRoot = () => {
  return document.getElementById("root")
}

submitButton.addEventListener('click', async () => {
  const formData = {
    subredditName: document.getElementById('subreddit').value,
    filterParams: document.getElementById("filterParams").value
  }
  window.electronAPI.setSubredditInfo(formData)
})

window.electronAPI.setPage((event, value) => {
  getRoot().innerHTML = value
})