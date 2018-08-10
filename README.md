# H5lock

## How to use?
```
<script type="text/javascript" src="src/H5lock.publish.js"></script>
<script type="text/javascript">
    new H5lock({
        rows: 3,
        width: 180,
        height: 180,
        canvasId: 'unlock',
        callBack: function (data) {
            console.log("in callback \n" + JSON.stringify(data, null, 2));
        }
    }).init();
</script>
```

