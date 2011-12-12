<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page isELIgnored="false"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>任务完整信息</title>
        <meta name="author" content="pangwu86" />
        <style>
            body {
                background-color: rgba(199,237,204, 0.6);
            }

            .task {
            }

            table {
                margin: 2px;
            }

            .title td {
                color: #FFFFFF;
                font-weight: bold;
                line-height: 22px;
                overflow: hidden;
                padding-left: 2px;
                text-align: left;
                text-shadow: 1px 1px 2px #FFFFFF;
                white-space: nowrap;
                background: -moz-linear-gradient(center top , #000000, #111111 50%, #222222 75%, #000000) repeat scroll 0 0 transparent;
                border-bottom: 1px solid #222222;
                height: 24px;
            }

            .report {
            }

            #detail {
                width: 100%;
                height: 200px;
                margin: 2px;
            }
        </style>
    </head>
    <body>
        <%=request.getAttribute("obj")%>
    </body>
    <script>
        window.onload = function() {
            var detail = document.getElementById("detail_hid").innerHTML;
            var detailDiv = document.getElementById("detail");
            detailDiv.innerText = detail;
            detailDiv.innerHTML = detail;
            detailDiv.value = detail;
        };
    </script>
</html>
