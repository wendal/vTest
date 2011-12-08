package org.vtest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Random;

import org.nutz.dao.Dao;
import org.nutz.lang.Lang;
import org.nutz.lang.random.StringGenerator;
import org.vtest.model.Report;
import org.vtest.model.Robot;
import org.vtest.model.Task;
import org.vtest.ui.TaskModule;

public class TestDataMaker {

	private static String detail;

	private static Random random = new Random();

	private static StringGenerator stringGenerator = new StringGenerator(10);

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

	public static void makeTestData(int num, Dao dao, Class<?>[] clzs) {
		// 添加测试数据
		if (num == 0) {
			num = 1;
		}
		for (int i = 0; i < clzs.length; i++) {
			Class<?> clz = clzs[i];
			// 清空数据库
			dao.clear(clz);
			for (int j = 0; j < num; j++) {
				dao.fastInsert(getAnObj(clz));
			}
		}
	}

	public static Object getAnObj(Class<?> clz) {
		if (clz == Robot.class) {
			return getAnRobot();
		} else if (clz == Report.class) {
			return getAnReport();
		} else if (clz == Task.class) {
			return getAnTask();
		} else {
			throw Lang.noImplement();
		}
	}

	private static Object getAnTask() {
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

	private static Robot getAnRobot() {
		Robot robot = new Robot();
		robot.setIpv4("192.168.1." + random.nextInt(255));
		robot.setHnm(stringGenerator.next());
		robot.setPrid(String.valueOf(random.nextInt(10000)));
		robot.setLm(VTests.now());
		return robot;
	}

	private static Object getAnReport() {
		Report report = new Report();
		report.setErr(random.nextInt(2));
		report.setLm(VTests.now());
		report.setMsg("各种错误信息哈哈哈啊哈哈哈哈哈哈哈哈");
		report.setRid(random.nextInt(100));
		report.setStep(random.nextInt(5));
		report.setTid(random.nextInt(100));
		report.setTotal(random.nextInt(3000));
		report.setDura(random.nextInt(500)
						+ ","
						+ random.nextInt(5000)
						+ ","
						+ random.nextInt(3000));
		return report;
	}

}
