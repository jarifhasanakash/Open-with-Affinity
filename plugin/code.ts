figma.showUI(__html__, { width: 300, height: 340 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-selection') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Please select an image or a node with an image fill.");
      return;
    }

    const node = selection[0];
    
    // Check if node has image fills
    const imageFills = ('fills' in node && Array.isArray(node.fills)) 
      ? node.fills.filter(fill => fill.type === 'IMAGE') 
      : [];

    if (imageFills.length === 0) {
      figma.notify("Selected node doesn't have an image fill.");
      return;
    }

    const fill = imageFills[0] as ImagePaint;
    const image = figma.getImageByHash(fill.imageHash);
    
    if (image) {
      const bytes = await image.getBytesAsync();
      figma.ui.postMessage({
        type: 'image-data',
        bytes: bytes,
        fileName: `${node.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
      });
    }
  }

  if (msg.type === 'update-image') {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) return;

    const node = selection[0] as GeometryMixin;
    const newBytes = new Uint8Array(msg.bytes);
    const newImage = figma.createImage(newBytes);

    const newFills = (node.fills as Paint[]).map(fill => {
      if (fill.type === 'IMAGE') {
        return {
          ...fill,
          imageHash: newImage.hash
        };
      }
      return fill;
    });

    node.fills = newFills;
    figma.notify("Image updated from Affinity!");
  }
};
