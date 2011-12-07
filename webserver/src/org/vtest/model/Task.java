package org.vtest.model;

import java.sql.Clob;
import java.sql.Timestamp;

import lombok.Data;

import org.nutz.dao.entity.annotation.ColDefine;
import org.nutz.dao.entity.annotation.ColType;
import org.nutz.dao.entity.annotation.Column;
import org.nutz.dao.entity.annotation.Comment;
import org.nutz.dao.entity.annotation.Id;
import org.nutz.dao.entity.annotation.Table;

@Table("t_task")
@Data
public class Task {

	@Id
	@Comment("主键")
	private int id;

	@Column("nm")
	@Comment("任务名称")
	private String name;

	@Column
	@ColDefine(type = ColType.INT, width = 1)
	@Comment("任务名称， 0 新创建，1 开始执行，2 已经完成")
	private int stat;

	@Column
	@Comment("创建时间")
	private Timestamp ct;

	@Column
	@Comment("最后被机器人修改的时间")
	private Timestamp lm;

	@Column
	@Comment("任务配置清单")
	private Clob detail;

	@Column
	@Comment("任务被执行的数量，当某个机器人执行完毕后，会给这个数加一")
	private int done;

	@Column
	@Comment("表示 done>= 多少后，这个任务算完成")
	private int fnn;

	@Column
	@Comment("成功数量，当某个机器人执行完毕，并且任务执行成功后，给这个数加一")
	private int nok;

	@Column
	@Comment("失败数量，当某个机器人执行完毕，并且任务执行失败后，给这个数加一")
	private int nfail;

}
