package org.vtest.model;

import java.sql.Timestamp;

import lombok.Data;

import org.nutz.dao.entity.annotation.ColDefine;
import org.nutz.dao.entity.annotation.ColType;
import org.nutz.dao.entity.annotation.Column;
import org.nutz.dao.entity.annotation.Comment;
import org.nutz.dao.entity.annotation.Id;
import org.nutz.dao.entity.annotation.Table;

@Table("t_task_re")
@Data
public class Report {
	@Id
	@Comment("主键")
	private int id;

	@Column
	@Comment("机器人ID")
	private int rid;

	@Column
	@Comment("任务ID")
	private int tid;

	@Column
	@Comment("最后修改时间")
	private Timestamp lm;

	@Column
	@ColDefine(type = ColType.INT, width = 1)
	@Comment("结果类型 0 表示成功，1 表示任务失败, 2 表示内部错误")
	private int err;

	@Column
	@ColDefine(type = ColType.INT, width = 5)
	@Comment("第几步失败的，0 表示没有失败，>0 表示第几步失败")
	private int step;

	@Column
	@Comment("具体的失败原因")
	@ColDefine(type = ColType.TEXT)
	private String msg;

	@Column
	@Comment("执行的总时间，单位 ms")
	private int total;

	@Column
	@ColDefine(type = ColType.VARCHAR, width = 300)
	@Comment("半角逗号分隔的时间，单位 ms，表示任务每一步所花费的时间")
	private String dura;

}
