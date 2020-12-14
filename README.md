![](https://github.com/joax/thunderbird-mentions/workflows/CI/badge.svg)

![Logo](/icon-128.png?raw=true "Mentions of Contacts")

# Mentions of contacts on email composer (proof of concept)
This Add-On implements the feature of adding contacts onto the email body with a link to email the contact. This feature was seen in other email applications like Gmail or Yahoo Mail.

## IMPORTANT
This add-on is the result of a proof of concept work to mimic the same behavior of the [Gmail and Yahoo mail mentions](https://www.indiatoday.in/technology/news/story/gmail-now-lets-you-mention-people-here-s-how-you-can-use-it-1238939-2018-05-22).

## Requirements
This add-on has been tested on Thunderbird 78.5.0 on Ubuntu 20.04. Please provide feedback or issues and bugs via the issues tab of this repo.

# Screenshots
![Autofill](/preview-autofill.png?raw=true "Autofill")
![Filled](/preview-filled?raw=true "Contact chosen")
![Added](/preview-added-to-cc.png?raw=true "Added to CC")
![Preview](/preview-on-email.png?raw=true "How it looks on email")
![Click](/preview-click-on-link.png?raw=true "Click on the Link opens new composer")

# Install
You can download the XPI file direcly from the releases or find this add-on on the Thuderbird add-ons page searching for 'mentions'.
If you downloaded the XPI, you can install it by going to Add-Ons > Install Add-on from File.

# Instructions
The process is as easy as when writing your email, do Space + @. This will trigger the search. Start typing the name or email of the person you'd like to include. If this contact is found in your addressBooks, then select it (either arrow down + Enter or click on it). This will add the contact link to the text.

## Include the Contacts on the CC field
If you want to add the contacts added on the body to the CC of the email (the standard behavior in other email clients) just press the button on the toolbar that reads "Add Mentions" or press **Ctrl + J**.

# Feedback or improvements
Happy to work on the suggestions via the Add-on page or the Issues page on this repository.