// Images
let img_Background;
let img_Mouse
let img_MainObjectToClick
let img_Tier1Upgrade
let img_Tier2Upgrade
let img_Tier3Upgrade
let img_Tier4Upgrade
let img_Tier5Upgrade
let img_LockedUpgrade;
let img_UpgradeBG;
let img_ClickUpgrade;
let img_SoundOff;
let img_SoundOn;
let img_MouseHold;
let img_DataDelete;

// Misc
let myFont;
let globalMainObjectPos;
let globalMainObjectSize;
let muteSound;
let isMousePressed = false;
let canInteractWithClick = true;

// Gameplay Stats
let points = 0;
let numOfTier1Upgrades = 0;
let numOfTier2Upgrades = 0;
let numOfTier3Upgrades = 0;
let numOfTier4Upgrades = 0;
let numOfTier5Upgrades = 0;
let numOfClickUpgrades = 0;
let isTier1UpgradeLocked = true;
let isTier2UpgradeLocked = true;
let isTier3UpgradeLocked = true;
let isTier4UpgradeLocked = true;
let isTier5UpgradeLocked = true;
let manualPressPoints = 1;

// Class instances
let mainObjectToClick;
var clickParticleSystem;
let tier1Upgrade;
let tier2Upgrade;
let tier3Upgrade;
let tier4Upgrade;
let tier5Upgrade;
let clickUpgrade;
let deleteDataButton;

// Sound
let soundEnabled = true;
var ambientAudio;



//*********************************************************************************************************************************
function preload()
{ 
  // Load images
  img_Mouse             = loadImage(Koji.config.images.img_Mouse);

  img_Background        = loadImage(Koji.config.images.img_Background);
  img_MainObjectToClick = loadImage(Koji.config.images.img_MainObjectToClick);
  img_Tier1Upgrade      = loadImage(Koji.config.images.img_Tier1Upgrade);
  img_Tier2Upgrade      = loadImage(Koji.config.images.img_Tier2Upgrade);
  img_Tier3Upgrade      = loadImage(Koji.config.images.img_Tier3Upgrade);
  img_Tier4Upgrade      = loadImage(Koji.config.images.img_Tier4Upgrade);
  img_Tier5Upgrade      = loadImage(Koji.config.images.img_Tier5Upgrade);
  img_LockedUpgrade     = loadImage(Koji.config.images.img_LockedUpgrade);
  img_UpgradeBG         = loadImage(Koji.config.images.img_UpgradeBG);
  img_ClickUpgrade      = loadImage(Koji.config.images.img_ClickUpgrade);
  img_SoundOn           = loadImage(Koji.config.images.img_SoundOn);
  img_SoundOff          = loadImage(Koji.config.images.img_SoundOff);
  img_MouseHold         = loadImage(Koji.config.images.img_MouseHold);
  img_DataDelete        = loadImage(Koji.config.images.img_DataDelete);

  // Load font
  var link  = document.createElement('link');
  link.href = Koji.config.strings.fontFamily;
  link.rel  = 'stylesheet';
  document.head.appendChild(link);
  myFont = getFontFamily(Koji.config.strings.fontFamily);

}

function setup()
{
  createCanvas(window.innerWidth, window.innerHeight);

  frameRate(30);

  textFont(myFont); // Set our font

  // Create Class instances
  clickParticleSystem = new ParticleSystem(createVector(window.innerWidth/2, window.innerHeight/2));
  mainObjectToClick   = new ObjectForClickingClass(img_MainObjectToClick);
  tier1Upgrade = new TierUpgradeClass(img_Tier1Upgrade, 0, window.innerHeight*0.0525, 1.37,  1, 4,     Koji.config.strings.tier1UpgradeName);
  tier2Upgrade = new TierUpgradeClass(img_Tier2Upgrade, 0, window.innerHeight*0.2175, 10,  2, 55,    Koji.config.strings.tier2UpgradeName);
  tier3Upgrade = new TierUpgradeClass(img_Tier3Upgrade, 0, window.innerHeight*0.3825, 50,  3, 715,   Koji.config.strings.tier3UpgradeName);
  tier4Upgrade = new TierUpgradeClass(img_Tier4Upgrade, 0, window.innerHeight*0.5475, 150, 4, 8500,  Koji.config.strings.tier4UpgradeName);
  tier5Upgrade = new TierUpgradeClass(img_Tier5Upgrade, 0, window.innerHeight*0.7125, 1200, 5, 100000, Koji.config.strings.tier5UpgradeName);
  clickUpgrade = new ClickUpgrade(img_ClickUpgrade, 50, Koji.config.strings.clickUpgradeName);
  muteSound = new MuteSoundButton();
  ambientAudio = new Audio(Koji.config.sounds.sound_Ambient);
  clickAudio   = new Audio(Koji.config.sounds.sound_ClickOnMainObject);
  upgradeAudio = new Audio(Koji.config.sounds.sound_Upgrade);
  deleteDataButton = new DeleteData();

  ambientAudio.loop = true; // Loop ambient sound
  if(soundEnabled)  ambientAudio.play();

  // Save game every 30 seconds
  setInterval(SaveGame, 30000);

  Init();
}

function draw()
{
  RenderBackground();
  
  let pointsPerSec = CalculatePointsPerSecond();
  noCursor();

  // Render Visuals
  UpdateTitle();
  UpdatePointsPerSecText(pointsPerSec);
  UpdateFpsText();
  mainObjectToClick.Render();

  tier1Upgrade.Tick();
  tier2Upgrade.Tick();
  tier3Upgrade.Tick();
  tier4Upgrade.Tick();
  tier5Upgrade.Tick();
  clickUpgrade.Tick();

  deleteDataButton.mousePressed();
  mainObjectToClick.mousePressed(manualPressPoints);
  muteSound.mousePressed();

  // Control particle system
  clickParticleSystem.run();

  UpdateCursor();
}

//******************************************************************************************************************
//******************************************************************************************************************
//******************************************************************************************************************
//


// Play sound
PlaySound = function (src)
{
  if(soundEnabled)
  {
    var audio = new Audio(src);
    audio.play(); 
  }
}


// Set the parameters from saved params
function Init()
{
  points = JSON.parse(window.localStorage.getItem('points'));
  if(points >= 1.1)
  {
    tier1Upgrade.isLocked = JSON.parse(window.localStorage.getItem('isTier1UpgradeLocked'));
    tier2Upgrade.isLocked = JSON.parse(window.localStorage.getItem('isTier2UpgradeLocked'));
    tier3Upgrade.isLocked = JSON.parse(window.localStorage.getItem('isTier3UpgradeLocked'));
    tier4Upgrade.isLocked = JSON.parse(window.localStorage.getItem('isTier4UpgradeLocked'));
    tier5Upgrade.isLocked = JSON.parse(window.localStorage.getItem('isTier5UpgradeLocked'));
    print(tier5Upgrade.isLocked);
  //if(tier1Upgrade.isLocked == false)
  { tier1Upgrade.numOfUpgrades = JSON.parse(window.localStorage.getItem('numOfTier1Upgrades')); }
  //if(tier2Upgrade.isLocked == false)
  { tier2Upgrade.numOfUpgrades = JSON.parse(window.localStorage.getItem('numOfTier2Upgrades')); }
 //if(tier3Upgrade.isLocked == false)
  { tier3Upgrade.numOfUpgrades = JSON.parse(window.localStorage.getItem('numOfTier3Upgrades')); }
 // if(tier4Upgrade.isLocked == false)
  { tier4Upgrade.numOfUpgrades = JSON.parse(window.localStorage.getItem('numOfTier4Upgrades')); }
  //if(tier5Upgrade.isLocked == false)
  { tier5Upgrade.numOfUpgrades = JSON.parse(window.localStorage.getItem('numOfTier5Upgrades')); }

    clickUpgrade.numOfUpgrades = JSON.parse(window.localStorage.getItem('numOfClickUpgrades')); 
    numOfClickUpgrades = clickUpgrade.numOfUpgrades;
  }
}

// Save params to local storage
function SaveGame()
{
  window.localStorage.setItem('points', JSON.stringify(points));
  window.localStorage.setItem('numOfTier1Upgrades', JSON.stringify(numOfTier1Upgrades));
  window.localStorage.setItem('numOfTier2Upgrades', JSON.stringify(numOfTier2Upgrades));
  window.localStorage.setItem('numOfTier3Upgrades', JSON.stringify(numOfTier3Upgrades));
  window.localStorage.setItem('numOfTier4Upgrades', JSON.stringify(numOfTier4Upgrades));
  window.localStorage.setItem('numOfTier5Upgrades', JSON.stringify(numOfTier5Upgrades));
  window.localStorage.setItem('isTier1UpgradeLocked', JSON.stringify(isTier1UpgradeLocked));
  window.localStorage.setItem('isTier2UpgradeLocked', JSON.stringify(isTier2UpgradeLocked));
  window.localStorage.setItem('isTier3UpgradeLocked', JSON.stringify(isTier3UpgradeLocked));
  window.localStorage.setItem('isTier4UpgradeLocked', JSON.stringify(isTier4UpgradeLocked));
  window.localStorage.setItem('isTier5UpgradeLocked', JSON.stringify(isTier5UpgradeLocked));
  window.localStorage.setItem('numOfClickUpgrades', JSON.stringify(numOfClickUpgrades));
}

// Class for the object that you click on to get points
function ObjectForClickingClass(objectImage, imageX_Pos, imageY_Pos)
{
  this.size = window.innerHeight/2.5;
  this.pos = createVector((window.innerWidth/1.5) -(this.size/2),  (window.innerHeight/2.5) -(this.size/2));
  this.img = objectImage;
  let tempPosForPointsText = createVector(this.pos.x + this.size/2, this.pos.y - this.size/9);
  globalMainObjectPos = this.pos;
  globalMainObjectSize = this.size;

  this.Render = function()
  {
    colorMode(RGB, 255);
    image(this.img, this.pos.x, this.pos.y, this.size, this.size);
    UpdatePointsText(tempPosForPointsText);
  }

  // Add points on Click
  this.mousePressed = function (pointsToAdd)
  {
    if (mouseX >= this.pos.x && mouseX <= this.pos.x + this.size &&
        mouseY >= this.pos.y && mouseY <= this.pos.y + this.size)
    {   
      // Hovered over this
      // ...

      // Pressed this
      if(isMousePressed == true && canInteractWithClick == true)
      {
        AddPoints(pointsToAdd * (numOfClickUpgrades+1));
        //window.localStorage.clear();  // Clear all saved params - used for testing
        PlaySound(Koji.config.sounds.sound_ClickOnMainObject);
        clickParticleSystem.addParticle(createVector(mouseX, mouseY));
        canInteractWithClick = false;
        return true;
      }
    }
    else
    {
      return false;
    }
  }
}

// Class for the point per sec upgrades
function TierUpgradeClass(tierImg, imageX_Pos, imageY_Pos, pointsPerSecToAdd, tier, pointCost, name)
{
    // Constructor
    this.size = window.innerHeight/10;
    this.pos = createVector(imageX_Pos, imageY_Pos);
    this.img = tierImg;
    this.tier = tier;
    this.isLocked = true;
    this.name = name;
    this.numOfUpgrades = 0;
    this.cost = pointCost;

    let backgroundImgSize = createVector(this.size*2,this.size*1.65);
    let tempPosForPointsText = createVector(this.pos.x + this.size/2, this.pos.y - this.size/2);

    this.Render = function()
    {
      // display image as locked until there is enough points for buying
      if(points < this.cost)
      {   
          if(this.isLocked == true)
          {
            this.img = img_LockedUpgrade;
          }
      }
      // display normal image
      else
      {
        this.img = tierImg;
        this.isLocked = false;

        switch(this.tier)
        {
          case 1: isTier1UpgradeLocked = false;
          break;
          case 2: isTier2UpgradeLocked = false;
          break;
          case 3: isTier3UpgradeLocked = false;
          break;
          case 4: isTier4UpgradeLocked = false;
          break;
          case 5: isTier5UpgradeLocked = false;
          break;
        }
      }
      
      // render the Main Upgrade image and background image
      image(img_UpgradeBG, this.pos.x, this.pos.y - this.size/1.9, backgroundImgSize.x, backgroundImgSize.y);
      image(this.img, this.pos.x+5, this.pos.y, this.size, this.size);

      // Darken the upgrade when there is not enough points for buying
      if(points < this.cost)
      {
          if(this.isLocked == false)
          {
            fill('rgba(25,0,0, 0.65)');
            rect(this.pos.x+5, this.pos.y, this.size, this.size);
          }
      }         
    }

    // Handle click
    this.mousePressed = function ()
    {
      // Clicked the upgrade
      if (mouseX >= this.pos.x && mouseX <= this.pos.x + this.size &&
          mouseY >= this.pos.y && mouseY <= this.pos.y + this.size &&
          isMousePressed == true && canInteractWithClick == true)
      {
        if(points >= this.cost)
        {
          this.numOfUpgrades++;
          RemovePoints(this.cost); 
          PlaySound(Koji.config.sounds.sound_Upgrade);

          switch(this.tier)
          {
            case 1: numOfTier1Upgrades = this.numOfUpgrades;
            break;
            case 2: numOfTier2Upgrades = this.numOfUpgrades;
            break;
            case 3: numOfTier3Upgrades = this.numOfUpgrades;
            break;
            case 4: numOfTier4Upgrades = this.numOfUpgrades;
            break;
            case 5: numOfTier5Upgrades = this.numOfUpgrades;
            break;
          }
            canInteractWithClick = false; // Stops the effect of holding the mouse down
            SaveGame();
            return true;
        }
        else
        {   
          return false;
        }
      }
    }
  
    this.RenderText = function()
    {
      // Display number of upgrades in ownership for given tier
      textSize(24);
      fill(Koji.config.colors.textColor);
      textAlign(LEFT);
      text(this.numOfUpgrades, imageX_Pos+this.size+10, imageY_Pos+this.size/2);

      // Display current cost of the upgrade
      textSize(14);
      text("Cost: " +  Number(Math.round(this.cost+'e2')+'e-2'), imageX_Pos+5, imageY_Pos-5);

      // Display name of the upgrade
      textSize(18);
      textAlign(CENTER);
      text(this.name, imageX_Pos+backgroundImgSize.x/2, imageY_Pos-19);
      }

  // Tick - call all functions that need to tick into one so that code is cleaner in draw()
  this.Tick = function()
  {
    this.Render();
    this.RenderText();
    this.mousePressed();
    this.cost = (this.numOfUpgrades+1) * 1.13 * pointCost;
  }
}

function ClickUpgrade(clickUpgImg, pointCost, name)
{
    // Constructor
    let size = window.innerHeight/10;
    this.size = size;
    this.pos = createVector(size + size, window.innerHeight*0.7125);
    this.img = clickUpgImg;
    this.name = name;
    this.numOfUpgrades = 0;
    this.cost = pointCost;

    let backgroundImgSize = createVector(this.size*2,size*1.65);
    let tempPosForPointsText = createVector(this.pos.x + size/2, this.pos.y - size/2);

    this.Render = function()
    {
      // render the Main Upgrade image and background image
      image(img_UpgradeBG, this.pos.x, this.pos.y - this.size/1.9, backgroundImgSize.x, backgroundImgSize.y);
      image(this.img, this.pos.x+5, this.pos.y, this.size, this.size);

      // Darken the upgrade when there is not enough points for buying
      if(points < this.cost)
      {
        fill('rgba(25,0,0, 0.65)');
        rect(this.pos.x+5, this.pos.y, size, size);
      }         
    }

    this.mousePressed = function ()
    {
      // Clicked the upgrade
      if (mouseX >= this.pos.x && mouseX <= this.pos.x + size &&
          mouseY >= this.pos.y && mouseY <= this.pos.y + size &&
          isMousePressed == true && canInteractWithClick == true)
      {
        if(points >= this.cost)
        {
          this.numOfUpgrades = this.numOfUpgrades+1;
          numOfClickUpgrades = this.numOfUpgrades;
          RemovePoints(this.cost); 
          PlaySound(Koji.config.sounds.sound_Upgrade);
          canInteractWithClick = false; // Stops the effect of holding the mouse down
          SaveGame();
          return true;
        }
        else
        {
          return false;
        }
      }
    }

    // Display info of the upgrade in text form
    this.RenderText = function()
    {
      // Display number of upgrades in ownership for given tier
      textSize(24);
      fill(Koji.config.colors.textColor);
      textAlign(LEFT);
      text(this.numOfUpgrades, this.pos.x+size+10, this.pos.y+this.size/2);

      // Display current cost of the upgrade
      textSize(14);
      text("Cost: " +  Number(Math.round(this.cost+'e2')+'e-2'), this.pos.x+5, this.pos.y-5);

      // Display name of the upgrade
      textSize(18);
      textAlign(CENTER);
      text(this.name, this.pos.x+backgroundImgSize.x/2, this.pos.y-19);
      }

  // Call all functions that need to tick into one so that code is cleaner in draw()
  this.Tick = function()
  {
    this.cost = (pointCost*(this.numOfUpgrades*this.numOfUpgrades+1)*3.14);
    this.Render();
    this.RenderText();
    this.mousePressed();
  }
}

//
function AddPoints(pointsToAdd)
{
  points += pointsToAdd;
}

//
function RemovePoints(pointsToRemove)
{
  points -= pointsToRemove;
}

//
function CalculatePointsPerSecond()
{ 
    let pointsPerSec = 0;
    pointsPerSec += tier1Upgrade.numOfUpgrades *1.07 +
                    tier2Upgrade.numOfUpgrades *5.13 +
                    tier3Upgrade.numOfUpgrades *45.13 +
                    tier4Upgrade.numOfUpgrades *300.13 +
                    tier5Upgrade.numOfUpgrades *1000.13

    // Divides points per sec by framerate so that points are added every frame
    // Hardcoded to 30 because the frameRate() doesn't work
    let pointPerTick = pointsPerSec / 30;
    AddPoints(pointPerTick);

    return pointsPerSec;
}

//
function RenderBackground()
{
    background(img_Background);
    fill('rgba(25,0,0, 1)');
}

// set the image to follow the cursor
function UpdateCursor()
{
  // setup an image to follow our mouse
  let imageSize = window.innerHeight/8;
  if(canInteractWithClick)
  {
     image(img_Mouse, mouseX - (imageSize / 10), mouseY - (imageSize / 2), imageSize, imageSize);
    
  }
  else
  {
     image(img_MouseHold, mouseX - (imageSize / 10), mouseY - (imageSize / 2), imageSize, imageSize);
  }
 
}

//
function mousePressed()
{
  isMousePressed = true;
}

//
function mouseReleased()
{
  canInteractWithClick = true;
  isMousePressed = false;
}

// Particle class
var Particle = function(position)
{
  this.acceleration = createVector(0, 0.3);
  this.velocity = createVector(random(-1,1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 4000.0;
};
Particle.prototype.run = function()
{
  this.update();
  this.display();
};
// Method to update position
Particle.prototype.update = function()
{
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};
// Method to display
Particle.prototype.display = function()
{
  stroke(255, this.lifespan);
  strokeWeight(0);
  fill(color(Koji.config.colors.clr_ClickParticleSystem), this.lifespan);
  ellipse(this.position.x, this.position.y, 5, 5);
};
// Is the particle still useful?
Particle.prototype.isDead = function()
{
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};
var ParticleSystem = function(position)
{
  this.origin = position.copy();
  this.particles = [];
};
ParticleSystem.prototype.addParticle = function(position)
{
  this.particles.push(new Particle(position));
};
ParticleSystem.prototype.run = function() {
  for (var i = this.particles.length-1; i >= 0; i--)
  {
    var p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

//
function MuteSoundButton()
{
  let imageSize = window.innerHeight/15;
  this.pos = createVector(window.innerWidth-imageSize, 0);
  // setup an image to follow our mouse

  this.mousePressed = function ()
  {
    if(soundEnabled)
    {
      image(img_SoundOn, this.pos.x, this.pos.y, imageSize, imageSize);
    }
    else
    {
      image(img_SoundOff, this.pos.x, this.pos.y, imageSize, imageSize);
    }
    // Clicked mute
    if (mouseX >= this.pos.x && mouseX <= this.pos.x + imageSize &&
        mouseY >= this.pos.y && mouseY <= this.pos.y + imageSize &&
        isMousePressed == true && canInteractWithClick == true
        )
    {
      // Mute the sound if it is not muted and the other way around
      if(soundEnabled)
      {
        ambientAudio.pause();
        soundEnabled = false;
      }
      else
      {
        ambientAudio.play();
        soundEnabled = true;
      }
      canInteractWithClick = false; // Stops the effect of holding the mouse down
    }
  }
}


//
function DeleteData()
{
  let imageSize = window.innerHeight/15;
  this.pos = createVector(window.innerWidth-imageSize, window.innerHeight*0.75);
  // setup an image to follow our mouse

  this.mousePressed = function ()
  {
      image(img_DataDelete, this.pos.x, this.pos.y, imageSize, imageSize);

    // Clicked mute
    if (mouseX >= this.pos.x && mouseX <= this.pos.x + imageSize &&
        mouseY >= this.pos.y && mouseY <= this.pos.y + imageSize &&
        isMousePressed == true && canInteractWithClick == true)
    {
      window.localStorage.clear(); // Clear all saved params - used for testing

      canInteractWithClick = false; // Stops the effect of holding the mouse down
    }
  }
}

//
function UpdatePointsPerSecText(pointsPerSec)
{
  // format our text
  textSize((window.innerWidth + window.innerHeight)/80);
  fill(Koji.config.colors.textColor);
  textAlign(CENTER);
  // print out our text

  text(Koji.config.strings.pointsName + "/s: " + Number(Math.round(pointsPerSec+'e2')+'e-2'), globalMainObjectPos.x + globalMainObjectSize/2, globalMainObjectPos.y/* - innerHeight/20*/);
  
}

// Uncomment if needed
function UpdateFpsText()
{
  /*
  // format our text
  textSize((window.innerWidth + window.innerHeight)/100);
  fill(Koji.config.colors.textColor);
  textAlign(LEFT);
  text("FPS: " + Math.round(frameRate()), window.innerWidth/1.15, window.innerHeight/50);
  */
}

//
function UpdateTitle()
{
  textSize((window.innerWidth + window.innerHeight)/50);
  fill(Koji.config.colors.textColor);
  textAlign(CENTER, CENTER);
  text(Koji.config.strings.title, window.innerWidth / 1.5, window.innerHeight/20);
  
}

//
function UpdatePointsText(position)
{
  textSize((window.innerWidth + window.innerHeight)/60);
  fill(Koji.config.colors.textColor);
  textAlign(CENTER, CENTER);
  text(Koji.config.strings.pointsName + ": " + Math.round(points), position.x, position.y);
}

// Isolate the font name from the font link provided in game settings
function getFontFamily(ff)
{
  const start = ff.indexOf('family=');
  if (start === -1) return 'sans-serif';
  let end = ff.indexOf('&', start);
  if (end === -1) end = undefined;
  return ff.slice(start + 7, end);
}

