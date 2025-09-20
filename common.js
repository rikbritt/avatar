   function GetAssetsForCategory(cat)
  {
    var catAssets = [];
    for(var i=0; i<assetsList.length; ++i) {
      if(assetsList[i].type == cat.id)
      {
        catAssets.push(assetsList[i]);
      }
    }
    return catAssets;
  }

  function GetAssetsForFolder(folderId)
  {
    var out = [];
    for(var asset of assetsList)
    {
      if(asset.folder == folderId)
      {
        out.push(asset);
      }
    }
    return out;
  }

  function GetTopLevelFolders()
    {
      var folders = [];
      for(var asset of assetsList)
      {
        if(asset.type == "folder" && asset.folder == "")
        {
          folders.push(asset);
        }
      }
      return folders;
  }
