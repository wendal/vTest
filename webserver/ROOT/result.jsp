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
            }

            h1 {
                text-align: center;
            }

            .ct {
                position: absolute;
                right: 5px;
                margin-top: -22px;
            }

            .task {
            }

            table {
                margin: 2px;
            }

            .task tr td:first-child {
                color: #3333AA;
            }

            .report_tr td {
                color: #FFFFFF;
                font-weight: bold;
                line-height: 22px;
                overflow: hidden;
                padding-left: 2px;
                text-align: left;
                white-space: nowrap;
                background: -webkit-gradient(linear, 0 0, 0 100%, from(black), to(black), color-stop(.5,#222222), color-stop(.75,#333333));
                background: -moz-linear-gradient(top, black, #222222 50%, #333333 75%, black);
                border-bottom: 1px solid #222222;
                height: 24px;
            }

            .report {
            }

            .detail {
            }
        </style>
    </head>
    <body>
        <%=request.getAttribute("obj")%>
    </body>
    <script>
        window.onload = function() {
            var task_id = document.getElementById("task_id").innerHTML;
            var task_name = document.getElementById("task_name").innerHTML;
            var titleMsg = "任务:" + task_name + "(ID:" + task_id + ")运行报告";
            document.title = titleMsg;
        };
    </script>
</html>
