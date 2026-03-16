export const exportOnstFile = (state: any) => {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `network_project_${new Date().toISOString().split('T')[0]}.onst`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importOnstFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (err) {
        reject(new Error('Invalid .onst file format.'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed.'));
    reader.readAsText(file);
  });
};
