import toast from 'react-hot-toast';

export async function downloadTrack(mp3Url: string, title: string, artist: string) {
  try {
    toast.loading('Downloading...');
    const response = await fetch(mp3Url);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = `${title} - ${artist}.mp3`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    toast.dismiss();
    toast.success('Download completed');
  } catch (error) {
    console.error('Download error:', error);
    toast.dismiss();
    toast.error('Download failed');
  }
}