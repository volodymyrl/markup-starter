# Project Skeleton

### Gulp complex commands:
* `gulp` create build **with** localhost server and livereload;
* `gulp dev` create build **without** localhost server and livereload.

### SCSS
* All custom **scss** files locate in `scss/` folder;
* Entry point for all scss is `scss/app.scss` you can **import** all your *.scss* files from here;
* You **don't need** to write **prefixes** for different browsers like `-webkit` it will be done by the gulp.

### JS
* All custom **javascript** files locate in `js/` folder;
* Entry point for javascript is `js/app.js` you can **import** all you *.js* files from here using [ES6 import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) feature;
* All javascript is **babelified** so yes! You can use all kind of [ES6 features](https://babeljs.io/docs/learn-es2015/) here.

### Vendor
* All **extensions** must be installed by the [Bower](http://bower.io/#install-packages);
* After installing the extension you must **include its files**:
  * **js files** must be included in `vendor_entries/vendor.js` by adding new elements to the **array**;
  * **css or sass files** must be included in `vendor_entries/vendor.scss` using `@import`.
