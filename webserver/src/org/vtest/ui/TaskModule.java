package org.vtest.ui;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.nutz.dao.Cnd;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.ioc.loader.annotation.IocBean;
import org.nutz.lang.Lang;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.VTests;
import org.vtest.model.Task;

@InjectName
@IocBean
@At("/task")
public class TaskModule extends BasicModule {

	private static String detail;

	static {
		String str;
		StringBuilder sb = new StringBuilder();
		BufferedReader reader = new BufferedReader(new InputStreamReader(TaskModule.class.getResourceAsStream("/testdata/taskDemo.js")));
		try {
			while ((str = reader.readLine()) != null) {
				sb.append(str);
			}
			detail = sb.toString();
		}
		catch (IOException e) {
			throw Lang.wrapThrow(e);
		}
	}

	@Override
	@At
	public Object list() {
		return dao.query(Task.class, null, null);
	}

	@Override
	@At
	public Object delete(@Param("id") int id) {
		dao.delete(Task.class, id);
		return VTests.MSG_OK;
	}

	@Override
	@At
	public Object clear(@Param("ids") int[] ids) {
		dao.clear(Task.class, Cnd.where("id", "in", ids));
		return VTests.MSG_OK;
	}

	@Override
	@At
	public Object testData(@Param("num") int num) {
		// 清空数据库
		dao.clear(Task.class);
		// 添加测试数据
		if (num == 0) {
			num = 1;
		}
		for (int i = 0; i < num; i++) {
			dao.fastInsert(getAnTask());
		}
		return VTests.MSG_OK;
	}

	private Object getAnTask() {
		Task t = new Task();
		t.setCt(VTests.now());
		t.setDone(random.nextInt(100));
		t.setFnn(random.nextInt(100));
		t.setLm(VTests.now());
		t.setName(stringGenerator.next());
		t.setNfail(random.nextInt(100));
		t.setNok(random.nextInt(100));
		t.setStat(random.nextInt(2));
		t.setDetail(detail);
		return t;
	}

}
