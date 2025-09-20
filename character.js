
  var equippables = [
    "equipped_bg",
    "equipped_body",
    "equipped_frame",
    "equipped_placement"
  ];

  function CreateEmptyCharacterViewData()
  {
    var characterViewData = {};
    for(var equippable of equippables)
    {
      characterViewData[equippable] = { id:"", val:""};
    }
    return characterViewData;
  }

  function CreateCharacterViewDataFromData(d)
  {
    var characterViewData = CreateEmptyCharacterViewData();
    for(var equippable of equippables)
    {
      if(d[equippable] != undefined)
      {
        var equippedAsset = assets[d[equippable].val];
        characterViewData[equippable] = { id:d[equippable].val, val:equippedAsset ? equippedAsset.data : ""};
      }
    }
    return characterViewData;
  }

  function CreateCharacterViewDataFromUserData()
  {
    return CreateCharacterViewDataFromData(data);
  }

  function ApplyUserDataToCharacter()
  {
    var characterViewData = CreateCharacterViewDataFromUserData();
    ApplyToCharacter(characterViewData);
  }

  function ApplyToCharacter(characterViewData)
  {
    document.getElementById("bg").src = hostingUrl + characterViewData.equipped_bg.val;
    document.getElementById("body").src = hostingUrl + characterViewData.equipped_body.val;
    document.getElementById("frame").src = hostingUrl + characterViewData.equipped_frame.val;
    document.getElementById("body").className = "character_body " + characterViewData.equipped_placement.id;
  }

  function OnClickedCharacter()
  {
    document.getElementById("statusbar").style.display = "block";
    document.getElementById("donebutton").style.display = "block";
  }