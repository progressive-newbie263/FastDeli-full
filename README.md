"fix lỗi tailwind v4. "

For anyone looking after upgrading to v4:

If you have a main css file where you have @import "tailwindcss"; and some other css file with @apply, you will get an error unless you add @reference "./global.css";(file with tailwind import) to the top of that file