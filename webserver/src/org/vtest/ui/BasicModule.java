package org.vtest.ui;

import java.util.Random;

import org.nutz.dao.Dao;
import org.nutz.ioc.loader.annotation.Inject;
import org.nutz.lang.random.StringGenerator;

public abstract class BasicModule {

	@Inject("refer:dao")
	protected Dao dao;

	protected Random random = new Random();

	protected StringGenerator stringGenerator = new StringGenerator(10);

	public abstract Object list();

	public abstract Object delete(int id);

	public abstract Object clear(int[] ids);

	public abstract Object testData(int num);

}
