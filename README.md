[<img alt="Title" height="150" src="https://user-images.githubusercontent.com/16360374/31757195-ba3c3b24-b45c-11e7-8d74-4aef9849c473.png"/>](./README.md)
<br>
<p align="right">
  <a href="https://travis-ci.org/tterb/Hyde">
    <img alt="Build Status" height="21" src="https://travis-ci.org/tterb/Hyde.svg?branch=master"/>&nbsp;
  </a>
  <a href="https://codeclimate.com/github/tterb/Hyde">
    <img alt="Code Climate" height="21" src="https://codeclimate.com/github/tterb/Hyde/badges/gpa.svg"/>&nbsp;
  </a>
  <a href="https://david-dm.org/tterb/Hyde">
    <img alt="Dependency Status" height="21" src="https://david-dm.org/tterb/Hyde.svg"/>&nbsp;
  </a>
  <a href="https://badge.fury.io/gh/tterb%2FHyde">
    <img alt="Version" height="21" src="https://badge.fury.io/gh/tterb%2FHyde.svg"/>&nbsp;
  </a>
  <a href="https://www.gnu.org/licenses/">
  <img alt="License" height="21" src="https://img.shields.io/badge/License-GPL%20v3-blue.svg"/>&nbsp;
  </a>
  <!-- <a href="https://electron.atom.io/">
    <img src="https://img.shields.io/badge/powered_by-Electron-blue.svg" height="21" title="Electron"/>&nbsp;
  </a> -->
</p>

# Description


**Hyde** is an [Electron](http://electron.atom.io)-based markdown editor that aims to improve the accessibility of creating beautifully formatted markdown documents for developers and non-developers, alike.
This goal is achieved through an approachable modular interface, capable of offering the same familiar toolbars and live-preview that you would find in a word-processor or the simplicity and streamlined workflow of a minimalistic text editor.
Additionally, while **Hyde** was initially created to cater to [Jekyll](https://jekyllrb.com) users, during development the oppurtunity was recognized to similarly improve the writing experience across various platforms. Therefore, additional features have been integrated that allow Hyde to cater to the wide variety of popular platforms and tools that utilize markdown formatting.

<br>

<p align="center">
  <img src="https://user-images.githubusercontent.com/16360374/31935237-2bd9f582-b863-11e7-8db8-08e078bf61fd.png"/>
</p>

-------------------------

# Features

* Live Preview
  - Instantly observe changes to your documents in rendered Markdown or HTML as you create them
  - YAML frontmatter recongition ensures that only your intended content is rendered
* Sync-scrolling allows the preview to keep up with you as you type
* GitHub Flavored Markdown ([GFM](https://github.github.com/gfm/))
* User-friendly formatting via the toolbar
* Syntax highlighting for Markdown, GFM-compatible HTML, and YAML frontmatter
* A collection of 20+ popular syntax-themes
* :tada: [Font Awesome](http://fontawesome.io), [Glyphicon](http://glyphicons.com/), and [Emoji](https://www.webpagefx.com/tools/emoji-cheat-sheet/) support :tada:
* Full screen mode
  - Write free of all distractions
* Support for [TeX](https://www.latex-project.org/) math rendering
* Integrated spell-checking and word count
* App can remain active in tray for quick access
* All contained within an approachable, modular interface that caters to your workflow
* Cross platform
  - Windows, Mac and Linux ready

<br>

-------------------

# Installation

Cloning, installing, and running **Hyde** is as simple as executing the following commands:

```sh
# Clone the repository
$ git clone https://github.com/tterb/hyde

# Navigate to the directory
$ cd hyde

# Install Hyde
$ npm install -g ./
```

Now, **Hyde** can easily be launched from anywhere using the following command:

```sh
$ hyde <filename>
```
<br>

-------------------

# Development

Preprocessor compilation and live-reload functionalities are available via the following command:

```sh
$ gulp watch
```

<br>

-------------------

# Contributing

If you're looking for an easy way to contribute to this project but aren't sure where to start, I've created a list of minor bugs and/or issues to be fixed before the projects initial release, which you can find [here](../../issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20is%3Ahelpwanted) or you can just try out the app and [provide some feedback](../../issues/new).
Additionally, if you'd like to submit a pull-request, I would ask that you first take a look at the projects [contributing guidelines](/docs/CONTRIBUTING.md).

<br><br>

Proudly powered by:

[<img alt="Electron logo" height="50" src="http://electron.atom.io/images/electron-logo.svg">](http://electron.atom.io/)
