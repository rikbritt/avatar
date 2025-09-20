var rarities = {
  common:(hostingUrl + "ui/rarity/common.png"),
  uncommon:(hostingUrl + "ui/rarity/uncommon.png"),
  rare:(hostingUrl + "ui/rarity/rare.png"),
  ultra_rare:(hostingUrl + "ui/rarity/ultra_rare.png"),
  epic:(hostingUrl + "ui/rarity/epic.png"),
  legendary:(hostingUrl + "ui/rarity/legendary.png"),
  mythic:(hostingUrl + "ui/rarity/mythic.png")
}
var characterSelectionData = CreateEmptyCharacterViewData();
var selectedItemId = "";
var selectedCategory = 0;
var selectedFolder = "";

function ShowEdit()
{
  document.getElementById("editbar").style.display = "block";
}

function ApplySelectionToCharacter()
{
  ApplyToCharacter(characterSelectionData);
}

//function CreateCharacterSelectionDataFromUserData()
//{
//  return {
//      bg:{val:assets[data["equipped_bg"].val].data, id:data["equipped_bg"].val},
//      body:{val:assets[data["equipped_body"].val].data, id:data["equipped_body"].val},
//      frame:{val:assets[data["equipped_frame"].val].data, id:data["equipped_frame"].val},
//      placement:{val:assets[data["equipped_placement"].val].data, id:data["equipped_placement"].val},
//    };
//}

function ApplyUserDataToCharacterSelection()
{
    characterSelectionData = CreateCharacterViewDataFromUserData();
}

function GetOwnedAndCost(id)
{
  if(data[id] != null)
  {
    return {owned:true, cost:0};
  }
  return {owned:false, cost:assets[id].cost};
}

// Reset characterSelectionData entirely back to the user data,
// and apply to the current view.
function Edit_Revert()
{
  ApplyUserDataToCharacterSelection();
  ApplyToCharacter(characterSelectionData);
}

function Edit_ClearSelectionUI()
{
    document.getElementById("buy").style.display = "none";
    document.getElementById("set_item").style.display = "none";
    document.getElementById("item_cost").textContent = "";
    document.getElementById("item_name").textContent = "- - -";
    document.getElementById("shop_selected_rarity").style.display = "none";
}

function Shop_SelectItem(itemId)
{
  console.log(`Shop_SelectItem(${itemId})`);
  if(itemId == "" || itemId == null)
  {
    selectedItemId = "";
    Edit_ClearSelectionUI();
    return;
  }

  var lastSelectedElement = document.getElementById(`item_${selectedItemId}`);
  if(lastSelectedElement)
  {
    lastSelectedElement.classList.remove("rainbowAnim");
  }

  var asset = assets[itemId];
  if(asset == null)
  {
    console.log("Unknown item");
    return;
  }
  if(asset.type == "folder")
  {
    Shop_SelectFolder(itemId);
    return;
  }

  selectedItemId = itemId

  var equipName = "equipped_" + asset.type;
  characterSelectionData[equipName] = {val:asset.data, id:itemId};

  document.getElementById("item_name").textContent = asset.name;
  document.getElementById("shop_selected_rarity").style.display = "block";
  document.getElementById("shop_selected_rarity").src = rarities[asset.rarity];

  var newSelectedElement = document.getElementById(`item_${itemId}`);
  if(newSelectedElement)
  {
    newSelectedElement.classList.add("rainbowAnim");
  }

  // does the player own it?
  var ownedAndCost = GetOwnedAndCost(itemId);
  if(ownedAndCost.owned)
  {
    document.getElementById("buy").style.display = "none";
    //document.getElementById("item_cost").style.display = "none";
    document.getElementById("item_cost").textContent = "Owned";
    document.getElementById("set_item").style.display = "block";
  }
  else
  {
    document.getElementById("buy").style.display = "block";
    document.getElementById("set_item").style.display = "none";
    document.getElementById("item_cost").textContent = ownedAndCost.cost;
    document.getElementById("item_cost").style.display = "block";
  }

  ApplySelectionToCharacter();
}

function Shop_UpdateItemsDisplay()
{
  var shopItemsDiv = document.getElementById("shop_items");
  shopItemsDiv.innerHTML = "";

  if(selectedFolder == "")
  {
    return;
  }

  var folderAssets = GetAssetsForFolder(selectedFolder);
  console.log(folderAssets);

  // Go up folder
  {
    var asset = assets[selectedFolder];
    var parentFolderId = asset.folder;
    //var parentIsTopLevel = asset[parentFolderId].folder == "";
    if(parentFolderId != "")
    {
      var shopItemHTML = `<div class="shop_item_container">`;
      shopItemHTML += `<div class="shop_item_container_inner">`;
      shopItemHTML += `<img id="item_${parentFolderId}" class="shop_item_bg" src="${hostingUrl + "ui/shop_item_back.png"}">`;
      shopItemHTML += `<img class="shop_item_img" src="${hostingUrl + "/ui/left.png"}" onclick="Shop_SelectItem('${parentFolderId}');">`;
      shopItemHTML += `</div>`;
      shopItemHTML += `</div>`;
      shopItemsDiv.innerHTML += shopItemHTML;
    }
  }

  for(var asset of folderAssets)
  {
    var ownedAndCost = GetOwnedAndCost(asset.id);

    // hide unless owned
    if(asset.shopMode != "buyable" && !ownedAndCost.owned && asset.type != "folder")
    {
      continue;
    }

    var shopItemHTML = `<div class="shop_item_container">`;
    shopItemHTML += `<div class="shop_item_container_inner">`;
    shopItemHTML += `<img id="item_${asset.id}" class="shop_item_bg ${ ownedAndCost.owned ? "shop_item_bg_bought" : ""}" src="${hostingUrl + "ui/shop_item_back.png"}">`;
    shopItemHTML += `<img class="shop_item_img" src="${hostingUrl + asset.data}" onclick="Shop_SelectItem('${asset.id}');">`;
    shopItemHTML += `</div>`;
    shopItemHTML += `</div>`;
    shopItemsDiv.innerHTML += shopItemHTML;
  }
}

function Shop_SelectFolder(folderId)
{
  console.log(`Shop_SelectFolder(${folderId})`);
  selectedFolder = folderId;
  
  //TODO: If it's a top level folder, revert current edits
  Edit_Revert();

  Shop_UpdateItemsDisplay();
  Edit_ClearSelectionUI();

  var asset = assets[selectedFolder];
  document.getElementById("item_name").textContent = asset.name;
}

function Edit_Done()
{
  document.getElementById("editbar").style.display = "none";
}

function RefreshShopSelections()
{
  // to fix
  //Edit_SelectCategory(selectedCategory);
  Shop_SelectItem(selectedItemId);
}

function Edit_Save()
{
  Shop_StartWait("Saving");
  google.script.run
  .withSuccessHandler(function(newData){
    document.getElementById("waitBox").style.display = "none";
    data = {};
    for(var d of newData)
    {
      data[d[0]] = {
        num:d[1],
        val:d[2]
      };
    }
    ApplyUserData();
    Shop_EndWait();
    }).SaveCharacterEdit(userName, characterSelectionData);
}

function Edit_Cancel()
{
  ApplyUserData();
}

function Shop_StartWait(text)
{
  document.getElementById("shop_wait_text").textContent = text;
  document.getElementById("shop_wait").style.display = "block";
}

function Shop_EndWait()
{
  document.getElementById("shop_wait").style.display = "none";
}

function Shop_BuySelectedItem()
{
  Shop_StartWait("Buying");
  google.script.run
  .withSuccessHandler(function(newData){
    document.getElementById("waitBox").style.display = "none";
    data = {};
    for(var d of newData)
    {
      data[d[0]] = {
        num:d[1],
        val:d[2]
      };
    }
    ApplyUserData();
    Shop_EndWait();
    }).BuyItem(userName, selectedItemId, characterSelectionData);
}


function SetupShopTabs()
{
  console.log("SetupShopTabs");
  var tabs = document.getElementById("category_tabs");

  var topLevelFolders = GetTopLevelFolders();
  console.log(topLevelFolders);

  for(var folder of topLevelFolders)
  {
    tabs.innerHTML += `<img src="${hostingUrl + folder.data}" onclick="Shop_SelectFolder('${folder.id}');" style="height:100%">`;
  }
  
  //var i=0;
  //for(var cat of categories)
  //{
  //  tabs.innerHTML += `<img src="${hostingUrl + cat.img}" onclick="Edit_SelectCategory(${i});" style="height:100%">`;
  //  i+=1;
  //}
}
