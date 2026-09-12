document.getElementById('show-fruits').addEventListener('click',()=>{
  document.getElementById('fruits').classList.remove('hidden');
  document.getElementById('vegetables').classList.add('hidden');
});

document.getElementById('show-vegetables').addEventListener('click',()=>{
  document.getElementById('vegetables').classList.remove('hidden');
  document.getElementById('fruits').classList.add('hidden');
});

// Simple enhancement: toggle via keyboard (F and V)
document.addEventListener('keydown',e=>{
  if(e.key.toLowerCase()==='f') document.getElementById('show-fruits').click();
  if(e.key.toLowerCase()==='v') document.getElementById('show-vegetables').click();
});
