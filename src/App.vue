<script setup lang="ts">
// App setup code here
</script>

<template>
  <router-view />
</template>

<style>
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';

/* Base styles */
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #fff;
  line-height: 1.6;
}

/* Remove default margin/padding */
html, body {
  padding: 0;
  margin: 0;
}

/* Default link styling */
a {
  color: #4d87c7;
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: #2c4f7c;
  text-decoration: underline;
}

/* Focus outline for accessibility */
*:focus {
  outline: 2px solid #4d87c7;
  outline-offset: 2px;
}

/* Fix for mobile tap highlight */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Success/error states for copy buttons */
.code-copy-button.copy-success {
  background-color: #42b983 !important;
  color: white !important;
  border-color: #42b983 !important;
}

.code-copy-button.copy-error {
  background-color: #e64a19 !important;
  color: white !important;
  border-color: #e64a19 !important;
}

/* Prism.js customizations */
pre[class*="language-"] {
  margin: 1.5em 0;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6a9955;
}

.token.punctuation {
  color: #d4d4d4;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #b5cea8;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #ce9178;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #d4d4d4;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #569cd6;
}

.token.function,
.token.class-name {
  color: #dcdcaa;
}

.token.regex,
.token.important,
.token.variable {
  color: #d16969;
}

/* Override backgrounds to match our theme */
code[class*="language-"],
pre[class*="language-"] {
  text-shadow: none;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

/* Adjust for our copy button placement */
pre.code-block {
  padding-right: 4.5em;
}
</style>
