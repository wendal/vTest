package org.vtest.ui;

import org.nutz.dao.Dao;
import org.nutz.ioc.loader.annotation.Inject;

public abstract class BasicModule {

	@Inject("refer:dao")
	protected Dao dao;

	public abstract Object list();

	public abstract Object delete(int id);

	public abstract Object clear(int[] ids);

	public abstract Object testData(int num);

}
