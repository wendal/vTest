package org.vtest.ui;

import java.util.List;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Ok;
import org.nutz.mvc.annotation.Param;
import org.vtest.VTests;
import org.vtest.model.Report;
import org.vtest.model.Task;

@InjectName
@IocBean
@At("/task")
public class TaskModule extends BasicModule<Task> {

	@At
	public Object insert(@Param("..") Task task) {
		// 一些初始化参数
		task.setCt(VTests.now());
		task.setDone(0);
		task.setLm(task.getCt());
		task.setNfail(0);
		task.setNok(0);
		task.setStat(0);
		dao.fastInsert(task);
		return VTests.MSG_OK;
	}

	@At
	@Ok("jsp:/result.jsp")
	public Object showResult(@Param("id") int id) {
		// 查询task
		Task task = dao.fetch(Task.class, id);
		if (task == null) {
			return "没有查到对应的数据";
		}
		// 失败的task
		List<Report> reports = dao.query(Report.class, Cnd.where("tid", "=", id)
															.and("err", "!=", 0)
															.asc("lm"), null);
		return getReportHtml(task, reports);
	}

	private String getReportHtml(Task task, List<Report> reports) {
		StringBuilder html = new StringBuilder();
		html.append("<h1>任务运行报告</h1>");
		html.append("<div class=\"ct\">生成时间：").append(VTests.now().toString()).append("</div>");
		html.append("<hr>");
		html.append("<h2>任务信息</h2>");
		html.append("<table class=\"task\" width=\"300px\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">");
		html.append("<tr>");
		html.append("<td>任务ID</td>");
		html.append("<td id=\"task_id\">").append(task.getId()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>任务名称</td>");
		html.append("<td id=\"task_name\">").append(task.getName()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>任务状态</td>");
		html.append("<td>").append(task.getStat() == 2 ? "已经完成" : "未完成").append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>目标次数</td>");
		html.append("<td>").append(task.getFnn()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>完成次数</td>");
		html.append("<td>").append(task.getDone()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>成功次数</td>");
		html.append("<td>").append(task.getNok()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>失败次数</td>");
		html.append("<td>").append(task.getNfail()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>创建时间</td>");
		html.append("<td>").append(task.getCt()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>最后更新</td>");
		html.append("<td>").append(task.getLm()).append("</td>");
		html.append("</tr>");
		html.append("<tr>");
		html.append("<td>详细配置</td>");
		html.append("<td>&nbsp;</td>");
		html.append("</tr>");
		html.append("</table>");
		html.append("<pre class=\"detail\">").append(task.getDetail()).append("</pre>");
		html.append("<hr>");
		if (reports != null && reports.size() != 0) {
			html.append("<h2>报告汇总</h2>");
			html.append("<table class=\"report\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"1px\">");
			html.append("<tr class=\"report_tr\">");
			html.append("<td>报告ID</td>");
			html.append("<td>任务ID</td>");
			html.append("<td>机器人ID</td>");
			html.append("<td>结果类型</td>");
			html.append("<td>错误步骤</td>");
			html.append("<td>更新时间</td>");
			html.append("<td>总用时</td>");
			html.append("<td>每步用时</td>");
			html.append("<td>错误信息</td>");
			html.append("</tr>");
			for (Report re : reports) {
				html.append("<tr>");
				html.append("<td>").append(re.getId()).append("</td>");
				html.append("<td>").append(re.getTid()).append("</td>");
				html.append("<td>").append(re.getRid()).append("</td>");
				html.append("<td>").append(re.getErr() == 1 ? "任务失败" : "内部错误").append("</td>");
				html.append("<td>").append(re.getStep()).append("</td>");
				html.append("<td>").append(re.getLm()).append("</td>");
				html.append("<td>").append(re.getTotal()).append("</td>");
				html.append("<td>").append(re.getDura()).append("</td>");
				html.append("<td>").append(re.getMsg()).append("</td>");
				html.append("</tr>");
			}
			html.append("</table>");
			html.append("<br>");
		} else {
			html.append("<b>没有错误信息</b>");
		}
		return html.toString();
	}
}
