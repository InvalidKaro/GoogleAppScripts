// Replace 'WEBHOOK_URL' with your Discord webhook URL, optional
var discordWebhookUrl = 'WEBHOOK_URL';

function onFormSubmit(e) {
  console.log('Form submission received.');

  var form = FormApp.getActiveForm();
  var items = form.getItems();

  // Find the password input field by its title
  var passwordFieldTitle = 'Password';
  var passwordField = null;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item.getTitle() === passwordFieldTitle && item.getType() === FormApp.ItemType.TEXT) {
      passwordField = item.asTextItem();
      break;
    }
  }

  if (passwordField === null) {
    console.log('Password field not found.');
    return;
  }

  // Generate a new password
  var newPassword = generatePassword(20);

  // Update the input value for the password field
  passwordField.createResponse(newPassword);

  // Escape special characters in the generated password
  var escapedPassword = escapeRegExp(newPassword);

  // Update the validation for the password field
  var validation = FormApp.createTextValidation()
    .setHelpText('Please enter the new password as displayed in the form help text.')
    .requireTextMatchesPattern('.*' + escapedPassword + '.*')
    .build();

  // Remove the existing validation from the password field
  passwordField.setValidation(null);

  // Set the new validation for the password field
  passwordField.setValidation(validation);

  // Send a Discord webhook with the new password
  sendDiscordWebhook(newPassword);
}

function generatePassword(length) {
  var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=[]{}|:;"<>,.?/';
  var password = '';

  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }

  return password;
}

// The code below is optional if you want to be notified in Discord 

function sendDiscordWebhook(password) {
  console.log('Sending Discord webhook with the new password.');

  var payload = {
    embeds: [
      {
        title: 'New Password',
        description: 'The password has been updated',
        "thumbnail": {
                  "url": " "
                },
        "footer": {
                    "text": " "
                },
        fields: [
          {
            name: 'Password',
            value: `||${password}||`,
          },
          
        ],
      },
    ],
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(discordWebhookUrl, options);

  console.log('Discord webhook sent successfully.');
}

// The code below is required

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
