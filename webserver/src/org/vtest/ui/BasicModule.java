package org.vtest.ui;

import org.nutz.dao.Cnd;
import org.nutz.dao.Dao;
import org.nutz.ioc.loader.annotation.Inject;
import org.nutz.lang.Lang;
import org.nutz.lang.Mirror;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.Param;
import org.vtest.TestDataMaker;
import org.vtest.VTests;

public abstract class BasicModule<T> {

	@Inject("refer:dao")
	protected Dao dao;

	/**
	 * service类
	 */
	private Class<T> clz = null;
	/**
	 * 是否已经初始化。
	 */
	private boolean isInitialized = false;

	/**
	 * 构造函数。
	 */
	public BasicModule() {
		init();
	}

	/**
	 * 初始化。
	 */
	private void init() {
		if (!isInitialized) {
			setClass();
			if (isInitialized && null == clz) {
				throw Lang.makeThrow("Can't set the class [%s]", getClass());
			}
		}
	}

	/**
	 * 获得泛型实际类型。
	 */
	@SuppressWarnings("unchecked")
	private void setClass() {
		this.clz = (Class<T>) Mirror.getTypeParam(getClass(), 0);
		isInitialized = true;
	}

	/**
	 * 获得范型。
	 * 
	 * @return
	 */
	public Class<T> getClz() {
		return clz;
	}

	@At
	public Object list() {
		return dao.query(getClz(), null, null);
	}

	@At
	public Object delete(@Param("id") int id) {
		dao.delete(getClz(), id);
		return VTests.MSG_OK;
	}

	@At
	public Object clear(@Param("ids") Integer[] ids) {
		dao.clear(getClz(), Cnd.where("id", "in", ids));
		return VTests.MSG_OK;
	}

	@At
	public Object testData(@Param("num") int num) {
		TestDataMaker.makeTestData(num, dao, new Class<?>[]{getClz()});
		return VTests.MSG_OK;
	}

}
