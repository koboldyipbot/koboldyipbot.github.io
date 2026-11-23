import {getTwitchUtils} from 'twitchUtils';
import {DEFAULT_MANAGED_CHANNEL_POINT_REWARDS, TwitchChannelPoints} from 'twitchChannelPoints';

let twitchUtils = getTwitchUtils(secrets.twitch.streamer);
window.twitchUtils = twitchUtils;

const VALID_COLOR_CODE = /^#[\da-fA-F]{6}$/

// default values for managed channel point rewards

let formGenerators = {};

class FormEntryGenerator {
  static STATUS_NOCHANGE = 'No changes made.';
  static STATUS_NEW = 'Not created yet!';
  static STATUS_CHANGE = 'Changes ready to submit!';
  static STATUS_ERROR = 'Check red fields for errors.';
  static STATUS_UPDATED = 'Channel Point reward updated!';
  static STATUS_CREATED = 'Channel Point reward created!';
  static STATUS_DESYNC = 'Remote channel points were manually deleted - see instructions.';
  static STATUS_SAVED_TO_FILE = 'Saved to file successfully.';
  static STATUS_PREPARING_TO_SUBMIT = 'Preparing to submit...';

  constructor(defaultRewards, rewardIndex, reward = {}) {
    this.rewardIndex = rewardIndex;
    this.reward = reward;
    this.defaultReward = defaultRewards[rewardIndex];
    this.changeSet = new Set();
    this.errorSet = new Set();
  }

  async createEntry(wrapper) {
    let managedChannelPointsEntry = document.createElement('div');
    managedChannelPointsEntry.classList = 'managedChannelPoints';
    wrapper.appendChild(managedChannelPointsEntry);

    this.idHead = this.createHeader('id', 'ID');
    this.id = this.createManagedField('id', this.reward.id);
    this.titleHead = this.createHeader('title', 'Title');
    this.title = this.createTextField('title');
    this.isEnabledHead = this.createHeader('is_enabled', 'Enabled');
    this.isEnabled = this.createCheckboxField('is_enabled', true);
    this.costHead = this.createHeader('cost', 'Channel Point Cost');
    this.cost = this.createNumberField('cost', '1', '1000000000');
    this.backgroundColorHead = this.createHeader('background_color', 'Background Color');
    this.backgroundColor = this.createColorField('background_color');
    this.isUserInputRequiredHead = this.createHeader('is_user_input_required', 'User Input Required?');
    this.isUserInputRequired = this.createCheckboxField('is_user_input_required')
    this.promptHead = this.createHeader('prompt', 'User Prompt');
    this.prompt = this.createTextField('prompt');
    this.isMaxPerStreamEnabledHead = this.createHeader('is_max_per_stream_enabled', 'Max Per Stream Enabled?');
    this.isMaxPerStreamEnabled = this.createCheckboxField('is_max_per_stream_enabled');
    this.maxPerStreamHead = this.createHeader('max_per_stream', 'Max Per Stream');
    this.maxPerStream = this.createNumberField('max_per_stream', 1);
    this.isMaxPerUserPerStreamEnabledHead = this.createHeader('is_max_per_user_per_stream_enabled', 'Max Per User Per Stream Enabled?');
    this.isMaxPerUserPerStreamEnabled = this.createCheckboxField('is_max_per_user_per_stream_enabled');
    this.maxPerUserPerStreamHead = this.createHeader('max_per_user_per_stream', 'Max Per User Per Stream');
    this.maxPerUserPerStream = this.createNumberField('max_per_user_per_stream', 1);
    this.isGlobalCooldownEnabledHead = this.createHeader('is_global_cooldown_enabled', 'Global Cooldown Enabled?');
    this.isGlobalCooldownEnabled = this.createCheckboxField('is_global_cooldown_enabled');
    this.globalCooldownHead = this.createHeader('global_cooldown_seconds', 'Global Cooldown Seconds');
    this.globalCooldown = this.createNumberField('global_cooldown_seconds', 1);
    this.skipRequestQueueHead = this.createHeader('should_redemptions_skip_request_queue', 'Skip Request Queue?');
    this.skipRequestQueue = this.createCheckboxField('should_redemptions_skip_request_queue');

    this.statusEntryHead = this.createHeader('status', 'Channel Point Status');
    let statusText = FormEntryGenerator.STATUS_NEW;
    if (this.reward.id !== null && this.reward.id !== undefined) {
      statusText = FormEntryGenerator.STATUS_NOCHANGE;
    }
    this.statusEntry = this.createManagedField('status', statusText);

    function setupCheckboxText(checkboxWrapper, relatedText) {
      let checkbox = checkboxWrapper.children[0];

      function doCheck() {
        if (checkbox.checked) {
          relatedText.disabled = false;
          relatedText.classList.remove('disabledText');
          relatedText.classList.add('enabledText');
        } else {
          relatedText.disabled = true;
          relatedText.classList.remove('enabledText');
          relatedText.classList.add('disabledText');
        }
      }
      checkbox.addEventListener('change', (e) => { doCheck(); });
      doCheck();
    }

    setupCheckboxText(this.isUserInputRequired, this.prompt);
    setupCheckboxText(this.isMaxPerStreamEnabled, this.maxPerStream);
    setupCheckboxText(this.isMaxPerUserPerStreamEnabled, this.maxPerUserPerStream);
    setupCheckboxText(this.isGlobalCooldownEnabled, this.globalCooldown);

    managedChannelPointsEntry.appendChild(this.idHead);
    managedChannelPointsEntry.appendChild(this.id);
    managedChannelPointsEntry.appendChild(this.titleHead);
    managedChannelPointsEntry.appendChild(this.title);
    managedChannelPointsEntry.appendChild(this.isEnabledHead);
    managedChannelPointsEntry.appendChild(this.isEnabled);
    managedChannelPointsEntry.appendChild(this.costHead);
    managedChannelPointsEntry.appendChild(this.cost);
    managedChannelPointsEntry.appendChild(this.backgroundColorHead);
    managedChannelPointsEntry.appendChild(this.backgroundColor);
    managedChannelPointsEntry.appendChild(this.isUserInputRequiredHead);
    managedChannelPointsEntry.appendChild(this.isUserInputRequired);
    managedChannelPointsEntry.appendChild(this.promptHead);
    managedChannelPointsEntry.appendChild(this.prompt);
    managedChannelPointsEntry.appendChild(this.isMaxPerStreamEnabledHead);
    managedChannelPointsEntry.appendChild(this.isMaxPerStreamEnabled);
    managedChannelPointsEntry.appendChild(this.maxPerStreamHead);
    managedChannelPointsEntry.appendChild(this.maxPerStream);
    managedChannelPointsEntry.appendChild(this.isMaxPerUserPerStreamEnabledHead);
    managedChannelPointsEntry.appendChild(this.isMaxPerUserPerStreamEnabled);
    managedChannelPointsEntry.appendChild(this.maxPerUserPerStreamHead);
    managedChannelPointsEntry.appendChild(this.maxPerUserPerStream);
    managedChannelPointsEntry.appendChild(this.isGlobalCooldownEnabledHead);
    managedChannelPointsEntry.appendChild(this.isGlobalCooldownEnabled);
    managedChannelPointsEntry.appendChild(this.globalCooldownHead);
    managedChannelPointsEntry.appendChild(this.globalCooldown);
    managedChannelPointsEntry.appendChild(this.skipRequestQueueHead);
    managedChannelPointsEntry.appendChild(this.skipRequestQueue);
    managedChannelPointsEntry.appendChild(this.statusEntryHead);
    managedChannelPointsEntry.appendChild(this.statusEntry);
  }

  addChange(fieldName) {
    if (this.errorSet.size > 0) {
      this.statusEntry.textContent = FormEntryGenerator.STATUS_ERROR;
      this.statusEntry.classList.add('errorHighlight');
    } else {
      this.statusEntry.textContent = FormEntryGenerator.STATUS_CHANGE;
      this.statusEntry.classList.remove('errorHighlight');
    } 
    this.changeSet.add(fieldName);
  }

  removeChange(fieldName) {
    if (this.errorSet.size > 0) {
      this.statusEntry.textContent = FormEntryGenerator.STATUS_ERROR;
      this.statusEntry.classList.add('errorHighlight');
    } else if (this.changeSet.size === 1) {
      if (!this.reward.id) {
        this.statusEntry.textContent = FormEntryGenerator.STATUS_NEW;
      } else {
        this.statusEntry.textContent = FormEntryGenerator.STATUS_NOCHANGE;
      }
      this.statusEntry.classList.remove('errorHighlight');
    } else {
      this.statusEntry.textContent = FormEntryGenerator.STATUS_CHANGE;
      this.statusEntry.classList.remove('errorHighlight');
    }
    this.changeSet.delete(fieldName);
  }

  addError(fieldName) {
    this.errorSet.add(fieldName);
    this.statusEntry.textContent = FormEntryGenerator.STATUS_ERROR;
    this.statusEntry.classList.add('errorHighlight');
  }

  removeError(fieldName) {
    this.errorSet.delete(fieldName);
    if (this.errorSet.size === 0) {
      this.statusEntry.classList.remove('errorHighlight');
      if (this.changeSet.size === 0) {
        if (!this.reward.id) {
          this.statusEntry.textContent = FormEntryGenerator.STATUS_NEW;
        } else {
          this.statusEntry.textContent = FormEntryGenerator.STATUS_NOCHANGE;
        }
      } else {
        this.statusEntry.textContent = FormEntryGenerator.STATUS_CHANGE;
      } 
    }
  }

  createHeader(headerName, headerText) {
    let header = document.createElement('p');
    header.classList = `${headerName}Head managedChannelPointsHeader`;
    header.textContent = headerText;
    return header;
  }

  createManagedField(fieldName, defaultText = '') {
    let managedField = document.createElement('p');
    managedField.classList = `${fieldName}Entry entryField`;
    managedField.id = `${fieldName}${this.rewardIndex}`;
    managedField.textContent = defaultText;

    return managedField;
  }

  createCheckboxField(fieldName, defaultState = false) {
    let me = this;

    let checkboxField = document.createElement('input');
    checkboxField.id = `${fieldName}${this.rewardIndex}`;
    checkboxField.setAttribute('type', 'checkbox');
    if (typeof(this.reward[fieldName]) === 'boolean') {
      checkboxField.checked = this.reward[fieldName];
    } else if (typeof(this.defaultReward[fieldName]) === 'boolean') {
      checkboxField.checked = this.defaultReward[fieldName];
    } else {
      checkboxField.checked = defaultState;
    }

    let fieldWrapper = document.createElement('span');
    fieldWrapper.classList = `${fieldName}Entry entryField`;
    fieldWrapper.appendChild(checkboxField);

    checkboxField.originalValue = checkboxField.checked;
    checkboxField.addEventListener('change', (e) => {
      if (checkboxField.originalValue !== checkboxField.checked) {
        checkboxField.classList.add('changedEntry');
        me.addChange(fieldName);
      } else {
        checkboxField.classList.remove('changedEntry');
        me.removeChange(fieldName);
      }
    });
    return fieldWrapper;
  }

  createNumberField(fieldName, min=null, max=null) {
    let me = this;
    let numberField = this.createTextField(fieldName);

    function validateNumber() {
      if (!numberField.reportValidity()) {
        me.addError(fieldName);
      } else {
        me.removeError(fieldName);
      }
    }

    numberField.addEventListener('input', validateNumber, false); // only emit error on clickout

    numberField.classList.add('numberInput');
    
    numberField.setAttribute('type', 'number');
    if (min) {
      numberField.setAttribute('min', min);
    }
    if (max) {
      numberField.setAttribute('max', max);
    }
    
    numberField.setAttribute('placeholder', this.defaultReward[fieldName] || 1);

    return numberField;
  }

  createTextField(fieldName) {
    let me = this;

    let textField = document.createElement('input');
    textField.classList = `${fieldName}Entry entryField enabledText`;
    textField.id = `${fieldName}${this.rewardIndex}`;
    textField.setAttribute('type', 'text');
    if (this.defaultReward[fieldName]) {
      textField.setAttribute('placeholder', this.defaultReward[fieldName]);
    }
    if (this.reward[fieldName] && this.defaultReward[fieldName] != this.reward[fieldName]) {
      textField.setAttribute('value', this.reward[fieldName]);
    }

    textField.originalValue = textField.value;
    textField.addEventListener('input', (e) => {
      if (textField.originalValue !== textField.value && textField.value !== textField.placeholder) {
        textField.classList.add('changedEntry');
        me.addChange(fieldName);
      } else {
        textField.classList.remove('changedEntry');
        me.removeChange(fieldName);
      }
    });

    // let fieldWrapper = document.createElement('li');
    // fieldWrapper.appendChild(textField);
    return textField;
  }

  createColorField(fieldName) {
    let me = this;
    let colorField = this.createTextField(fieldName);

    function validateColorOnChange() {
      colorField.reportValidity();
    }

    function validateColorOnInput() {
      colorField.setCustomValidity('');
      let valid = VALID_COLOR_CODE.test(colorField.value || colorField.placeholder);
      if (!valid) {
        colorField.setCustomValidity('Use hex color format: #xxxxxx\nEach x can be 0-9, a-f, or A-F');
        me.addError(fieldName);
      } else {
        me.removeError(fieldName);
      }
    }

    colorField.addEventListener('change', validateColorOnChange, false); // only emit error on clickout
    colorField.addEventListener('input', validateColorOnInput, false); // don't annoy user with popups every character input
    
    return colorField;
  }

  async submitChannelPointChanges() {
    this.statusEntry.classList.remove('errorHighlight');
    this.statusEntry.textContent = FormEntryGenerator.STATUS_PREPARING_TO_SUBMIT;

    let body = {
      title: this.title.value || this.title.placeholder,
      cost: this.cost.value || this.cost.placeholder,
      prompt: this.prompt.value || this.prompt.placeholder,
      background_color: this.backgroundColor.value || this.backgroundColor.placeholder,
      is_enabled: this.isEnabled.children[0].checked,
      is_user_input_required: this.isUserInputRequired.children[0].checked,
      is_max_per_stream_enabled: this.isMaxPerStreamEnabled.children[0].checked,
      max_per_stream: this.maxPerStream.value || this.maxPerStream.placeholder,
      is_max_per_user_per_stream_enabled: this.isMaxPerUserPerStreamEnabled.children[0].checked,
      max_per_user_per_stream: this.maxPerUserPerStream.value || this.maxPerUserPerStream.placeholder,
      is_global_cooldown_enabled: this.isGlobalCooldownEnabled.children[0].checked,
      global_cooldown_seconds: this.globalCooldown.value || this.globalCooldown.placeholder,
      // is_paused: , // patch only - we do not touch this currently
      should_redemptions_skip_request_queue: this.skipRequestQueue.children[0].checked
    };

    let id = !this.id.textContent ? null : this.id.textContent;

    await TwitchChannelPoints.upsertReward(
      twitchUtils,
      id,
      body.title,
      body.cost,
      body.prompt,
      body.is_enabled,
      body.background_color,
      body.is_user_input_required,
      body.is_max_per_stream_enabled,
      body.max_per_stream,
      body.is_max_per_user_per_stream_enabled,
      body.max_per_user_per_stream,
      body.is_global_cooldown_enabled,
      body.global_cooldown_seconds,
      body.should_redemptions_skip_request_queue
    ).then((resp) => {
      this.statusEntry.textContent = !id ? FormEntryGenerator.STATUS_CREATED : FormEntryGenerator.STATUS_UPDATED;
      this.reward = resp.data[0];
      this.id.textContent = this.reward.id;

      this.id.classList.remove('errorHighlight');
      this.id.classList.remove('changedEntry');
      this.title.classList.remove('errorHighlight');
      this.title.classList.remove('changedEntry');
      this.isEnabled.children[0].classList.remove('changedEntry');
      this.cost.classList.remove('errorHighlight');
      this.cost.classList.remove('changedEntry');
      this.backgroundColor.classList.remove('errorHighlight');
      this.backgroundColor.classList.remove('changedEntry');
      this.isUserInputRequired.children[0].classList.remove('changedEntry');
      this.prompt.classList.remove('errorHighlight');
      this.prompt.classList.remove('changedEntry');
      this.isMaxPerStreamEnabled.children[0].classList.remove('changedEntry');
      this.maxPerStream.classList.remove('errorHighlight');
      this.maxPerStream.classList.remove('changedEntry');
      this.isMaxPerUserPerStreamEnabled.children[0].classList.remove('changedEntry');
      this.maxPerUserPerStream.classList.remove('errorHighlight');
      this.maxPerUserPerStream.classList.remove('changedEntry');
      this.isGlobalCooldownEnabled.children[0].classList.remove('changedEntry');
      this.globalCooldown.classList.remove('errorHighlight');
      this.globalCooldown.classList.remove('changedEntry');
      this.skipRequestQueue.children[0].classList.remove('changedEntry');
    }).catch((error) => {
      console.log(error);
      this.statusEntry.textContent = error.message;
      this.statusEntry.classList.add('errorHighlight');
    });
  }
}

async function resetChannelPointRewards() {
  let existingChannelPoints = await TwitchChannelPoints.getRewards(twitchUtils);
  window.existingChannelPoints = existingChannelPoints;
  let deletes = 0;
  for (let i = 0; i < existingChannelPoints.data.length; i++) {
    let existingReward = existingChannelPoints.data[i];
    TwitchChannelPoints.deleteReward(twitchUtils, existingReward.id).then(() => {
      deletes += 1;
      if (deletes >= existingChannelPoints.data.length) {
        setupChannelPointsUI();
      }
    });
  }
}

function setupConfirmPrompt(promptText, functionToCall) {
  let confirmButtonsWrapper = document.getElementById('confirmButtonsWrapper');

  confirmButtonsWrapper.textContent = '';

  let confirmText = document.createElement('p');
  confirmText.classList = 'buttons';
  confirmText.textContent = promptText;
  confirmButtonsWrapper.appendChild(confirmText);

  let buttonsDiv = document.createElement('div');
  buttonsDiv.classList = 'buttons';
  confirmButtonsWrapper.appendChild(buttonsDiv);

  let confirmButton = document.createElement('input');
  confirmButton.setAttribute('type', 'button');
  confirmButton.value = 'Yes';
  buttonsDiv.appendChild(confirmButton);

  confirmButton.addEventListener('click', () => {
    functionToCall();
    let confirmButtonsWrapper = document.getElementById('confirmButtonsWrapper');
    confirmButtonsWrapper.style.display = 'none'
  });

  let cancelButton = document.createElement('input');
  cancelButton.setAttribute('type', 'button');
  cancelButton.value = 'Cancel';
  buttonsDiv.appendChild(cancelButton);
  cancelButton.addEventListener('click', () => {
    let confirmButtonsWrapper = document.getElementById('confirmButtonsWrapper');
    confirmButtonsWrapper.style.display = 'none';
  });

  confirmButtonsWrapper.style.display = '';
}

async function submitChannelPointChanges() {
  for (let channelPointModule in formGenerators) {
    let rewardArray = formGenerators[channelPointModule];
    for (let i = 0; i < rewardArray.length; i++) {
      let formGenerator = rewardArray[i];
      if (!formGenerator.reward.id || formGenerator.changeSet.size > 0) {
        await formGenerator.submitChannelPointChanges();
      }
    }
  }

  await generateManagedFile();
}

async function loadChannelPoints(existingChannelPoints = []) {
  document.getElementById('waitingWrapper').style.display = '';
  let managed = document.getElementById('managedChannelPointsWrapper');
  managed.textContent = '';
  loadChannelPointsInner(existingChannelPoints).then(() => {
    document.getElementById('waitingWrapper').style.display = 'none';
  });
}

async function loadChannelPointsInner(existingChannelPoints = []) {
  let managed = document.getElementById('managedChannelPointsWrapper');
  let defaultRewards = DEFAULT_MANAGED_CHANNEL_POINT_REWARDS.tf_machine;
  formGenerators = {
    tf_machine: []
  };

  let desync = false;
  if (existingChannelPoints.length > 0 && existingChannelPoints.length != defaultRewards.length) {
    // Invalid state; display existing entries & prevent edits until user resets
    desync = true;
    document.getElementById('submitPointsButton').disabled = true;
    document.getElementById('regenerateFileButton').disabled = true;
  } else {
    document.getElementById('submitPointsButton').disabled = false;
    document.getElementById('regenerateFileButton').disabled = false;
  }

  for (let i = 0; i < defaultRewards.length; i++) {
    let entryGenerator = new FormEntryGenerator(defaultRewards, i, existingChannelPoints[i]);
    formGenerators.tf_machine.push(entryGenerator);
    await entryGenerator.createEntry(managed);
    if (desync) {
      entryGenerator.statusEntry.textContent = FormEntryGenerator.STATUS_DESYNC;
      entryGenerator.statusEntry.classList.add('errorHighlight');
    }
  }
}

/**
 * Stores a mapping of the default & expected remote names mapped to the ID of the reward generated.
 * Format:
 *  {
 *     module_name: {
 *       defaultRewards: {
 *         defaultTitle: rewardID
 *       },
 *       customizedRewards: {
 *         customTitle: rewardID
 *       }
 *     }
 *  }
 */
async function generateManagedFile() {
  let managedLocalChannelPointMap = {};

  for (let channelPointModule in formGenerators) {
    let defaultRewards = {};
    let customizedRewards = {};
    managedLocalChannelPointMap[channelPointModule] = {
      defaultRewards: defaultRewards,
      customizedRewards: customizedRewards
    };
    let rewardArray = formGenerators[channelPointModule];
    for (let i = 0; i < rewardArray.length; i++) {
      let formGenerator = rewardArray[i];
      let defaultTitle = formGenerator.defaultReward.title;
      defaultRewards[defaultTitle] = formGenerator.reward.id;

      let customTitle = formGenerator.title.value || null;
      if (customTitle !== null) {
        customizedRewards[customTitle] = formGenerator.reward.id;
      }
    }
  }

  await fetch(`${window.location.origin}/channel_points`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(managedLocalChannelPointMap)
  });
}

async function generateManagedFileButton() {
  await generateManagedFile();
  for (let channelPointModule in formGenerators) {
    let rewardArray = formGenerators[channelPointModule];
    for (let i = 0; i < rewardArray.length; i++) {
      rewardArray[i].statusEntry.textContent = FormEntryGenerator.STATUS_SAVED_TO_FILE;
    }
  }
}

function setupResetButton() {
  setupConfirmPrompt('Are you sure you want to reset your channel points?', resetChannelPointRewards);
}

function setupSubmitButton() {
  setupConfirmPrompt('Are you sure you want to submit your changes?', submitChannelPointChanges);
}

function setupRegenerateButton() {
  setupConfirmPrompt('Are you sure you want to regenerate your channel points file?', generateManagedFileButton);
}

async function setupChannelPointsUI() {
  // first, set ui to initial state
  let resetButton = document.getElementById('resetPointsButton');
  let submitButton = document.getElementById('submitPointsButton');
  let regenerateButton = document.getElementById('regenerateFileButton');

  resetButton.removeEventListener('click', setupResetButton);
  submitButton.removeEventListener('click', setupSubmitButton);
  regenerateButton.removeEventListener('click', setupRegenerateButton);
  submitButton.disabled = true;
  regenerateButton.disabled = true;

  // before loading: ensure reset button will always work
  resetButton.addEventListener('click', setupResetButton);

  // load channel points from Twitch
  let existingChannelPoints = await TwitchChannelPoints.getRewards(twitchUtils);
  loadChannelPoints(existingChannelPoints.data || []).then(() => {});

  // Enable button behavior
  submitButton.addEventListener('click', setupSubmitButton);
  regenerateButton.addEventListener('click', setupRegenerateButton);
}

window.addEventListener('load', setupChannelPointsUI, false);
