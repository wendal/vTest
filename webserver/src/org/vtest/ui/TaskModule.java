package org.vtest.ui;

import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.VTests;
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
}
