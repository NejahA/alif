const statusDiv = document.getElementById('status');
const spinner = document.getElementById('spinner');

document.getElementById('gaming').addEventListener('click', async () => {
  statusDiv.style.color = '#f43f5e';
  statusDiv.innerText = 'Applying gaming optimizations...';
  spinner.style.display = 'block';
  
  const result = await window.api.optimize('gaming');
  
  spinner.style.display = 'none';
  statusDiv.innerText = result;
});

document.getElementById('coding').addEventListener('click', async () => {
  statusDiv.style.color = '#10b981';
  statusDiv.innerText = 'Applying coding optimizations...';
  spinner.style.display = 'block';
  
  const result = await window.api.optimize('coding');
  
  spinner.style.display = 'none';
  statusDiv.innerText = result;
});
