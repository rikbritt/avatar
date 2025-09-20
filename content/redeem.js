function RestartAnimations(element, onAnimEndFunc) {
  element.addEventListener("animationend", onAnimEndFunc, { once: true });

  for (const animation of document.getAnimations()) {
    if (
      animation.effect instanceof KeyframeEffect &&
      element.contains(animation.effect.target)
    ) {
      animation.cancel();
      animation.play();
    }
  }
}

var countTimer = 0;
function CountUp(elementId, start, target) {
  console.log(`Counting up from ${start} to ${target}`);
  var e = document.getElementById(elementId);
  if (!e) {
    return;
  }

  if (start == target) {
    return;
  }

  var current = start;
  countTimer = setInterval(
    function () {
      var diff = target - current;
      var inc = Math.ceil(diff / 2);
      var maxInc = 200;
      if (inc > maxInc) {
        inc = maxInc;
      }
      var minInc = 5;
      if (inc < minInc && diff > minInc) {
        inc = minInc;
      }
      current += inc;
      e.textContent = current.toString();

      if (current == target) {
        clearInterval(countTimer);
        console.log("Finished counting up to " + target)
      }
    },
    50
  );
}

function PlayCodeRedeemedAnim(itemName, amount) {
  document.getElementById("rewardedItemImg").src = hostingUrl + assets[itemName].data;
  document.getElementById("rewardError").style.display = "none";
  document.getElementById("rewardOpen").play();
  document.getElementById("rewardedItem").style.display = "block";
  document.getElementById("rewardedItemImg").classList.add("rewardLeaveChestAnim");
  var startNumGems = parseInt(oldData["gems"].num);
  RestartAnimations(
    document.getElementById("rewardedItemImg"),
    function () {
      ApplyUserData();
      if (itemName == "gems") {
        CountUp("gems", startNumGems, startNumGems + amount);
      }
    }
  );

  if (amount == 1) {
    document.getElementById("rewardItemAmount").style.display = "none";
  }
  else {
    document.getElementById("rewardItemAmount").textContent = amount;
    document.getElementById("rewardItemAmount").classList.add("rewardLeaveChestAnimAmount");
    RestartAnimations(document.getElementById("rewardItemAmount"));
    document.getElementById("rewardItemAmount").style.display = "block";
  }
}

function PlayCodeFailedAnim() {
  document.getElementById("rewardError").style.display = "block";
  document.getElementById("rewardedItem").style.display = "none";
  setTimeout(function () { document.getElementById("rewardError").style.display = "none"; }, 2000);
}

function ApplyUserDataToPendingReward() {
  var rewards = GetPendingRewards();
  console.log(rewards);
  if (rewards.length == 0) {
    document.getElementById("pending_rewards").textContent = "No Keys";
    document.getElementById("pending_button").style.display = "none";
  }
  else {
    document.getElementById("pending_rewards").textContent = `${rewards.length} x Keys`;
    document.getElementById("pending_button").style.display = "inline-block";
  }
  document.getElementById("pending_rewards").style.display = "block";
}

function GetPendingRewards() {
  if (data["reward"] == undefined) {
    return [];
  }

  var rewards = data["reward"].val.split(",").filter(Boolean);;
  return rewards;
}

function OpenPendingReward() {
  document.getElementById("pending_button").style.display = "none";
  document.getElementById("pending_rewards").style.display = "none";

  google.script.run
    .withSuccessHandler(function (newData) {
      console.log("RedeemCode result = ");
      console.table(newData);

      document.getElementById("waitBox").style.display = "none";

      oldData = data;
      data = {};
      for (var d of newData.userData) {
        data[d[0]] = {
          num: d[1],
          val: d[2]
        };
      }

      if (!newData.redeemedOk) {
        PlayCodeFailedAnim();
        ApplyUserData();
      }
      else {
        PlayCodeRedeemedAnim(newData.redeemed.item, newData.redeemed.amount);
        // ApplyUserData done at end of anim
      }

      document.getElementById("rewardOpen").classList.remove("chestWaitAnim");
    }).UseRewardKey(userName);
}

function TryRedeem() {
  document.getElementById("rewardOpen").classList.add("chestWaitAnim");

  google.script.run
    .withSuccessHandler(function (newData) {
      console.log("RedeemCode result = ");
      console.table(newData);

      document.getElementById("waitBox").style.display = "none";
      if (!newData.redeemedOk) {
        PlayCodeFailedAnim();
      }
      else {
        PlayCodeRedeemedAnim(newData.redeemed.item, newData.redeemed.amount);
      }

      data = {};
      for (var d of newData.userData) {
        data[d[0]] = {
          num: d[1],
          val: d[2]
        };
      }
      ApplyUserData();
      document.getElementById("rewardOpen").classList.remove("chestWaitAnim");
    }).RedeemCode(userName, document.getElementById("code").value);
  //document.getElementById("waitBox").style.display = "block";

}